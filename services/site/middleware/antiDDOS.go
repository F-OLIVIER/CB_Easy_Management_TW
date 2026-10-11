package utils

import (
	"math"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type TokenBucket struct {
	mu             sync.Mutex
	tokens         float64
	maxTokens      float64
	refillRate     float64
	lastRefillTime time.Time
}

// NewTokenBucket crée une nouvelle instance TokenBucket.
func NewTokenBucket(maxTokens float64, refillRate float64) *TokenBucket {
	return &TokenBucket{
		tokens:         maxTokens,
		maxTokens:      maxTokens,
		refillRate:     refillRate,
		lastRefillTime: time.Now(),
	}
}

// recharge remplit le seau de jetons en fonction du temps écoulé depuis la dernière recharge.
func (tb *TokenBucket) refill() {
	now := time.Now()
	duration := now.Sub(tb.lastRefillTime)
	tokensToAdd := tb.refillRate * duration.Seconds()
	tb.tokens = math.Min(tb.tokens+tokensToAdd, tb.maxTokens)
	tb.lastRefillTime = now
}

// La requête vérifie si le bucket de jetons contient suffisamment de jetons pour une requête ?
func (tb *TokenBucket) Request(tokens float64) bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()
	tb.refill()
	if tokens <= tb.tokens {
		tb.tokens -= tokens
		return true
	}
	return false
}

// -------------------------------------------------------------------------
// Limiteur par client : un seau de jetons par adresse IP, au lieu d'un seau unique
// partagé par tous les utilisateurs (un seul client pouvait bloquer tout le monde).
// -------------------------------------------------------------------------

// Nombre maximal de clients suivis : au-delà, les nouveaux clients partagent un seau commun
// (une avalanche d'adresses différentes ne peut pas épuiser la mémoire).
const maxTrackedClients = 10000

type clientBucket struct {
	bucket   *TokenBucket
	lastSeen time.Time
}

type IPRateLimiter struct {
	mu          sync.Mutex
	clients     map[string]*clientBucket
	overflow    *TokenBucket
	maxTokens   float64
	refillRate  float64
	lastCleanup time.Time
}

func NewIPRateLimiter(maxTokens float64, refillRate float64) *IPRateLimiter {
	return &IPRateLimiter{
		clients:     map[string]*clientBucket{},
		overflow:    NewTokenBucket(maxTokens*10, refillRate*10),
		maxTokens:   maxTokens,
		refillRate:  refillRate,
		lastCleanup: time.Now(),
	}
}

// Proxy de confiance : connexion locale ou réseau privé (Caddy, Nginx de la PWA, réseau Docker)
func trustedProxy(ip net.IP) bool {
	return ip != nil && (ip.IsLoopback() || ip.IsPrivate())
}

// ClientIP renvoie l'adresse du client.
// X-Forwarded-For n'est lu que si la connexion vient d'un proxy de confiance ; on y prend alors la dernière
// adresse qui n'est pas un proxy (les premières entrées peuvent être inventées par le client).
func ClientIP(r *http.Request) string {
	remote := r.RemoteAddr
	if host, _, err := net.SplitHostPort(remote); err == nil {
		remote = host
	}
	if !trustedProxy(net.ParseIP(remote)) {
		return remote
	}
	entries := strings.Split(r.Header.Get("X-Forwarded-For"), ",")
	for i := len(entries) - 1; i >= 0; i-- {
		ip := net.ParseIP(strings.TrimSpace(entries[i]))
		if ip == nil {
			break // entrée invalide : le reste de l'en-tête n'est pas fiable
		}
		if !trustedProxy(ip) {
			return ip.String()
		}
	}
	return remote
}

// Allow consomme un jeton pour le client ; sinon répond 429 et renvoie false
func (l *IPRateLimiter) Allow(w http.ResponseWriter, r *http.Request) bool {
	if l.take(ClientIP(r)) {
		return true
	}
	w.Header().Set("Retry-After", "1")
	http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
	return false
}

func (l *IPRateLimiter) take(key string) bool {
	l.mu.Lock()
	now := time.Now()
	// Oubli des clients inactifs : la table ne grossit pas indéfiniment
	if now.Sub(l.lastCleanup) > time.Minute {
		for ip, client := range l.clients {
			if now.Sub(client.lastSeen) > 5*time.Minute {
				delete(l.clients, ip)
			}
		}
		l.lastCleanup = now
	}
	client, ok := l.clients[key]
	if !ok {
		if len(l.clients) >= maxTrackedClients {
			l.mu.Unlock()
			return l.overflow.Request(1)
		}
		client = &clientBucket{bucket: NewTokenBucket(l.maxTokens, l.refillRate)}
		l.clients[key] = client
	}
	client.lastSeen = now
	bucket := client.bucket
	l.mu.Unlock()
	return bucket.Request(1)
}
