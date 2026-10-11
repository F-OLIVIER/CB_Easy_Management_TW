package utils

import (
	"net/http/httptest"
	"testing"
)


func TestIPRateLimiterIsolatesClients(t *testing.T) {
	limiter := NewIPRateLimiter(3, 0.001)
	call := func(remoteAddr, forwardedFor string) int {
		r := httptest.NewRequest("POST", "/api/home/", nil)
		r.RemoteAddr = remoteAddr
		if forwardedFor != "" {
			r.Header.Set("X-Forwarded-For", forwardedFor)
		}
		w := httptest.NewRecorder()
		if limiter.Allow(w, r) {
			return 200
		}
		return w.Code
	}

	for i := 0; i < 3; i++ {
		if code := call("10.0.0.1:5000", ""); code != 200 {
			t.Fatalf("requête %d du client A refusée (%d)", i+1, code)
		}
	}
	if code := call("10.0.0.1:5001", ""); code != 429 {
		t.Fatalf("client A au-delà de la limite : attendu 429, obtenu %d", code)
	}
	// Un autre client n'est pas pénalisé par le premier
	if code := call("10.0.0.2:5000", ""); code != 200 {
		t.Fatalf("client B refusé à cause du client A (%d)", code)
	}
	// Derrière le proxy : même adresse de connexion, clients distingués par X-Forwarded-For
	if code := call("127.0.0.1:9000", "203.0.113.7, 172.18.0.5"); code != 200 {
		t.Fatalf("client derrière le proxy refusé (%d)", code)
	}
}

func TestClientIP(t *testing.T) {
	cases := []struct {
		name, remote, forwarded, want string
	}{
		{"connexion directe", "203.0.113.9:1234", "", "203.0.113.9"},
		// Accès direct au port publié : X-Forwarded-For inventé, ignoré
		{"client direct avec en-tête inventé", "203.0.113.9:1234", "1.2.3.4", "203.0.113.9"},
		{"derrière Caddy", "127.0.0.1:1234", "198.51.100.7", "198.51.100.7"},
		// Caddy puis Nginx de la PWA : la dernière adresse publique est le client
		{"derrière Caddy puis Nginx", "172.18.0.3:1234", "198.51.100.7, 172.18.0.1", "198.51.100.7"},
		// Entrées ajoutées par le client avant celles des proxys : ignorées
		{"entrées inventées en tête", "172.18.0.3:1234", "1.2.3.4, 198.51.100.7, 172.18.0.1", "198.51.100.7"},
		{"entrée invalide", "172.18.0.3:1234", "pas-une-ip", "172.18.0.3"},
		{"proxy sans en-tête", "127.0.0.1:1234", "", "127.0.0.1"},
	}
	for _, c := range cases {
		r := httptest.NewRequest("GET", "/", nil)
		r.RemoteAddr = c.remote
		if c.forwarded != "" {
			r.Header.Set("X-Forwarded-For", c.forwarded)
		}
		if got := ClientIP(r); got != c.want {
			t.Errorf("%s : obtenu %q, attendu %q", c.name, got, c.want)
		}
	}
}

func TestIPRateLimiterCapsTrackedClients(t *testing.T) {
	limiter := NewIPRateLimiter(1, 0.001)
	for i := 0; i < maxTrackedClients+50; i++ {
		limiter.take(string(rune(i)) + "-client")
	}
	if len(limiter.clients) > maxTrackedClients {
		t.Fatalf("%d clients suivis, maximum %d", len(limiter.clients), maxTrackedClients)
	}
}
