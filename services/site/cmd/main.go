package main

import (
	handlers "botgvg/handlers"
	data "botgvg/internal"
	"flag"
	"fmt"
	"net/http"
)

func main() {
	// Initialisation de la database
	data.Createdb()

	flag.Parse()

	// ServeMux pour gérer les routes
	mux := http.NewServeMux()

	// Page not connected
	routes_Dispatch := []string{
		"/",
		"/discord",
	}
	for _, route := range routes_Dispatch {
		mux.HandleFunc(route, handlers.ServeDispatch)
	}

	// page de transition de connexion Discord site internet
	mux.HandleFunc("/api/discord", handlers.DiscordApiHandler)
	// Page de connexion pour l'application mobile
	mux.HandleFunc("/api/discordapp", handlers.DiscordApiHandler)
	// Systéme de déconnexion
	mux.HandleFunc("/api/logout", handlers.LogoutHandler)
	// page utilisateur connected/autorised site internet
	routes_ApiHandler := []string{
		"/api/home/",
		"/api/charactercard/",
		"/api/updateCharacterCard/",
		"/api/caserne/",
		"/api/majcaserne/",
		"/api/creategroup/",
		"/api/saveGroupInDB/",
		"/api/chargergrouptypeatt/",
		"/api/chargergrouptypedef/",
		"/api/statGvG/",
		"/api/consulcaserne/",
		"/api/majspecificcaserne/",
		"/api/UpdateAdmin/",
		"/api/CheckAppAdmin/",
		"/api/adminitrateBot/",
		"/api/updatelanguage/",
		"/api/forum/",
		"/api/newpostforum/",
		"/api/newcommentforum/",
	}
	for _, route := range routes_ApiHandler {
		mux.HandleFunc(route, handlers.ApiHandler)
	}

	// page Application mobile
	mux.HandleFunc("/app/updatecaserne", handlers.AppMajCaserneHandler)
	routes_AppMobile := []string{
		"/app/login",
		"/app/user",
		"/app/caserne",
		"/app/charactercard",
		"/app/updatecharactercard",
		"/app/updateinscription",
		"/app/setting",
	}
	for _, route := range routes_AppMobile {
		mux.HandleFunc(route, handlers.AppMobileHandler)
	}

	// Fichiers statiques avec cache
	mux.HandleFunc("/css/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/css")
		http.StripPrefix("/css/", http.FileServer(http.Dir("public/css"))).ServeHTTP(w, r)
	})
	mux.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("./public/js"))))
	mux.Handle("/img/", http.StripPrefix("/img/", http.FileServer(http.Dir("./public/img"))))
	mux.Handle("/json/", http.StripPrefix("/json/", http.FileServer(http.Dir("./public/json"))))

	fmt.Println("Server started at : http://" + data.SITE_DOMAIN + ":" + data.PORT)

	// Mise en écoute du serveur HTTP
	err := http.ListenAndServe(":"+data.PORT, securityHeadersMiddleware(mux))
	if err != nil {
		fmt.Println("Erreur demarrage serveur :\n", err)
	}
}

// Middleware pour ajouter les en-têtes de sécurité
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		// w.Header().Set("Content-Security-Policy", "default-src 'self'; connect-src 'self' https://discord.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://cdn.discordapp.com data:;")
		w.Header().Set("Content-Security-Policy",
			`default-src 'self'; 
			script-src 'self' https://cdn.quilljs.com; 
			style-src 'self' https://fonts.googleapis.com https://cdn.quilljs.com 'unsafe-inline';
			font-src 'self' https://fonts.gstatic.com; 
			img-src 'self' https://cdn.discordapp.com data: blob:; 
			connect-src 'self' https://discord.com;
			frame-src 'self';`)
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "no-referrer-when-downgrade")
		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=()")
		next.ServeHTTP(w, r)
	})
}
