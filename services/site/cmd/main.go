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

	// Page not connected
	routes_Dispatch := []string{
		"/",
		"/discord",
	}
	for _, route := range routes_Dispatch {
		http.HandleFunc(route, handlers.ServeDispatch)
	}

	// page de transition de connexion Discord site internet
	http.HandleFunc("/api/discord", handlers.DiscordApiHandler)
	// Page de connexion pour l'application mobile
	http.HandleFunc("/api/discordapp", handlers.DiscordApiHandler)
	// Systéme de déconnexion
	http.HandleFunc("/api/logout", handlers.LogoutHandler)
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
	}
	for _, route := range routes_ApiHandler {
		http.HandleFunc(route, handlers.ApiHandler)
	}

	// page Application mobile
	http.HandleFunc("/app/updatecaserne", handlers.AppMajCaserneHandler)
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
		http.HandleFunc(route, handlers.AppMobileHandler)
	}

	// Appel des fichiers annexes et les mettres en cache navigateur client autmatiquement
	cssHandler := http.StripPrefix("/css/", http.FileServer(http.Dir("./public/css/")))
	http.HandleFunc("/css/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "max-age=31536000, only-if-cached")
		cssHandler.ServeHTTP(w, r)
	})

	jsHandler := http.StripPrefix("/js/", http.FileServer(http.Dir("./public/js/")))
	http.HandleFunc("/js/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "max-age=31536000, only-if-cached")
		jsHandler.ServeHTTP(w, r)
	})

	imgHandler := http.StripPrefix("/img/", http.FileServer(http.Dir("./public/images/")))
	http.HandleFunc("/img/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "max-age=31536000, only-if-cached")
		imgHandler.ServeHTTP(w, r)
	})

	jsonHandler := http.StripPrefix("/json/", http.FileServer(http.Dir("./public/json/")))
	http.HandleFunc("/json/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "max-age=31536000, only-if-cached")
		jsonHandler.ServeHTTP(w, r)
	})

	fmt.Println("Server started at : http://" + data.SITE_DOMAIN + ":" + data.PORT)

	// Mise en écoute du serveur HTTP
	http.ListenAndServe(":"+data.PORT, nil)
}
