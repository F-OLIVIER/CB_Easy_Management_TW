package main

import (
	handlers "easemanagementtw/handlers"
	data "easemanagementtw/internal"
	utils "easemanagementtw/middleware"
	"flag"
	"fmt"
	"net/http"
)

func main() {
	fmt.Println(`╭─────────────────────────────────────────────────╮
│       Server starting up, please wait ...       │
│─────────────────────────────────────────────────│`)

	// Initialisation de la database
	fmt.Println("│ • Create db in process                          │")
	data.Createdb(data.ADRESS_DB, "../database")

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
		"/api/updatestatGvG/",
		"/api/consulcaserne/",
		"/api/settingbot/",
		"/api/updatesettingbot/",
		"/api/majspecificcaserne/",
		"/api/UpdateAdmin/",
		"/api/CheckAppAdmin/",
		"/api/adminitrateBot/",
		"/api/updatelanguage/",
		"/api/forum/",
		"/api/newpostforum/",
		"/api/newcommentforum/",
		"/api/modifpostforum/",
	}
	for _, route := range routes_ApiHandler {
		mux.HandleFunc(route, handlers.ApiHandler)
	}

	// page Application multi-plateforme
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

	fmt.Println("│ • Initializing obfuscation file JS              │")
	utils.ObfuscateAllFiles("./src/js", "./public/js")
	// mux.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("./public/js"))))
	mux.Handle("/js/", http.StripPrefix("/js/", firstVisitCacheMiddleware(http.FileServer(http.Dir("./public/js")))))
	mux.HandleFunc("/css/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/css")
		http.StripPrefix("/css/", http.FileServer(http.Dir("public/css"))).ServeHTTP(w, r)
	})
	mux.Handle("/img/", http.StripPrefix("/img/", http.FileServer(http.Dir("./public/img"))))
	mux.Handle("/json/", http.StripPrefix("/json/", http.FileServer(http.Dir("./public/json"))))
	mux.Handle("/download/", http.StripPrefix("/download/", http.FileServer(http.Dir("./public/download"))))
	mux.Handle("/video/", http.StripPrefix("/video/", http.FileServer(http.Dir("./public/video"))))

	fmt.Println(`│─────────────────────────────────────────────────│
│               Start-up completed                │
│          Server ready : start listening         │
╰─────────────────────────────────────────────────╯`)
	fmt.Println("Server listen at : http://" + data.SITE_DOMAIN + ":" + data.PORT)

	// Mise en écoute du serveur HTTP
	err := http.ListenAndServe(":"+data.PORT, securityHeadersMiddleware(mux))
	if err != nil {
		fmt.Println("Erreur demarrage serveur :\n", err)
	}
}

// Fonction pour ajouter les en-têtes de sécurité à toutes les pages
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Oblige les navigateurs à utiliser HTTPS uniquement
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		// Sources autorisées
		w.Header().Set("Content-Security-Policy",
			`default-src 'self';
			connect-src 'self' https://discord.com; 
			style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.quilljs.com; 
			font-src 'self' https://fonts.gstatic.com;
			img-src 'self' https://cdn.discordapp.com data:; 
			script-src 'self' https://html2canvas.hertzen.com https://cdn.quilljs.com;`)
		// Intégration iframe du site interdite
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		// Empêche les navigateurs de deviner le type MIME d’un fichier et force à utiliser celui defini
		w.Header().Set("X-Content-Type-Options", "nosniff")
		// Envoie le 'Referer' (source des liens cliquer) seulement si la navigation est en HTTPS
		w.Header().Set("Referrer-Policy", "no-referrer-when-downgrade")
		// Interdit explicitement certaines API
		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=()")
		next.ServeHTTP(w, r)
	})
}

// Fonction pour forcer la mise à jour du cache des utilisateurs lors de la 1ere visite apres une MAJ
func firstVisitCacheMiddleware(next http.Handler) http.Handler {
	oldcookie := "08-2025_js_cache_updated"
	newCookie := "17-08-2025_js_cache_updated"

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Vérifie si le cookie existe
		_, err := r.Cookie(newCookie)
		if err != nil {
			// Premier passage -> on force la mise a jour du cache
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			w.Header().Set("Pragma", "no-cache")
			w.Header().Set("Expires", "0")

			// Création du cookie de mise à jour
			http.SetCookie(w, &http.Cookie{
				Name:   newCookie,
				Value:  "true",
				Path:   "/",
				MaxAge: 60 * 60 * 24 * 365, // 1 an
			})

			// Suppression de l'ancien cookie de mise à jour
			http.SetCookie(w, &http.Cookie{
				Name:   oldcookie,
				Value:  "",
				Path:   "/",
				MaxAge: -1,
			})
		}
		next.ServeHTTP(w, r)
	})
}
