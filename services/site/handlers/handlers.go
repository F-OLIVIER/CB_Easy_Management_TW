package handlers

import (
	"botgvg/appmobile"
	data "botgvg/internal"
	utils "botgvg/middleware"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"text/template"

	_ "github.com/mattn/go-sqlite3"
)

var tb = utils.NewTokenBucket(5, 5)

// Home page "/"
func ServeDispatch(w http.ResponseWriter, r *http.Request) {
	if tb.Request(1) {
		var ts *template.Template
		var err error

		switch r.URL.Path {
		case "/discord":
			ts, err = template.ParseFiles("./discord.html")
		default: // page "/"
			ts, err = template.ParseFiles("./index.html")
		}
		if err != nil {
			log.Fatal(err)
		}
		ts.Execute(w, nil)
	}
}

// Discord transition, user connects
func DiscordApiHandler(w http.ResponseWriter, r *http.Request) {
	if tb.Request(1) {
		if r.Method == "POST" {
			var sendHTML *data.SendHTML

			switch r.URL.Path {
			case "/api/discord":
				database, err := sql.Open("sqlite3", data.ADRESS_DB)
				utils.CheckErr("open db in DiscordApiHandler discord", err)
				defer database.Close()

				if utils.CheckUser(w, r, database) { // user connects
					gestion := &data.Gestion{
						Logged:   true,
						Redirect: "/home",
					}
					sendHTML = &data.SendHTML{
						Gestion: *gestion,
					}
				} else { // Connection failed
					gestion := &data.Gestion{
						Logged:   false,
						Redirect: "/",
					}
					sendHTML = &data.SendHTML{
						Gestion: *gestion,
					}
				}

			// case "/api/discordapp":
			// 	database, err := sql.Open("sqlite3", data.ADRESS_DB)
			// 	utils.CheckErr("open db in DiscordApiHandler discord", err)
			// 	defer database.Close()

			// 	validuser, uuidApp := appmobile.CheckUserApp(w, r, database)

			// 	if validuser { // user connects
			// 		gestion := &data.Gestion{
			// 			Logged:  true,
			// 			CodeApp: uuidApp,
			// 		}
			// 		sendHTML = &data.SendHTML{
			// 			Gestion: *gestion,
			// 		}
			// 	} else { // Connection failed
			// 		gestion := &data.Gestion{
			// 			Logged:  false,
			// 			CodeApp: "",
			// 		}
			// 		sendHTML = &data.SendHTML{
			// 			Gestion: *gestion,
			// 		}
			// 	}

			default:
				gestion := &data.Gestion{
					Logged:   false,
					Redirect: "/",
				}

				sendHTML = &data.SendHTML{
					Gestion: *gestion,
				}
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(sendHTML)
		}
	}
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if tb.Request(1) {
		_, err := r.Cookie("user_token")
		if err != http.ErrNoCookie {
			database, err := sql.Open("sqlite3", data.ADRESS_DB)
			utils.CheckErr("open db in homehandler", err)
			defer database.Close()
			utils.Logout(w, r, database)
		}
	}
}

func ApiHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("r.URL.Path in ApiHandler : ", r.URL.Path)

	if tb.Request(1) {
		var sendHTML *data.SendHTML
		// Read cookie
		cookie, err1 := r.Cookie("user_token")

		// Open database
		database, err := sql.Open("sqlite3", data.ADRESS_DB)
		utils.CheckErr("open db in homehandler", err)
		defer database.Close()

		if err1 != http.ErrNoCookie { // If cookie
			if !utils.CheckToken(utils.Sessions, cookie) { // If cookie not valid
				utils.Logout(w, r, database)
				gestion := &data.Gestion{
					Logged:   false,
					Redirect: "/",
				}
				sendHTML = &data.SendHTML{
					Gestion: *gestion,
				}
			} else { // If cookie valid
				// User information (un utilisateur peux faire partie de plusieurs maison)
				users, list_houses := utils.UserInfo(cookie.Value, database)

				// Lecture du fragment URL (maison à modifier pour l'utilisateur)
				id_Server := r.URL.Query().Get("house")

				id_House := ""
				for _, values := range list_houses {
					if values.ID_Server == id_Server {
						id_House = values.ID
						break
					}
				}

				// Assemblage des informations pour ne récupérer que les informations du couple utilisteur/house
				var currentUser data.ScearchUserInfo
				for _, values := range users {
					if values.ID_House == id_House {
						currentUser = values
						break
					}
				}

				// Information to send
				userInfo := &data.UserInfo{
					DiscordUsername: currentUser.DiscordUsername,
					DiscordPhoto:    currentUser.DiscordPhoto,
					Language:        currentUser.Language,
				}
				gestion := &data.Gestion{
					Logged:      true,
					Officier:    currentUser.Gestionnaire,
					Admin:       currentUser.Admin,
					BotActivate: utils.BotActivation(id_House, database),
				}
				sendHTML = &data.SendHTML{
					UserInfo: *userInfo,
					House:    list_houses,
				}

				// Additional information to be sent depending on the page
				if id_House != "" {
					switch r.URL.Path {
					case "/api/updatelanguage/":
						utils.UpdateLanguage(r, currentUser.User_id, database)

					// --------------------------------------------------
					// ----------------- Fiche personnage ---------------
					// --------------------------------------------------
					case "/api/charactercard/":
						gestion.ListClass = utils.ListClass(database)
						sendHTML.UserInfo = utils.Charactercard(cookie.Value, database)

					case "/api/updateCharacterCard/":
						utils.UpdateCharacter(r, currentUser, database)

					// --------------------------------------------------
					// --------------- Caserne utilisateur --------------
					// --------------------------------------------------
					case "/api/caserne/":
						sendHTML.ListUnit = utils.CaserneUser(currentUser.User_id, currentUser.ID_House, database)

					case "/api/majcaserne/":
						if r.Method == "POST" {
							utils.MAJCaserne(r, currentUser.User_id, id_House, database)
							gestion.Redirect = "/caserne"
						} else {
							return
						}

					// --------------------------------------------------
					// ----------------- ???? ---------------
					// --------------------------------------------------
					case "/api/CheckAppAdmin/":
						sendHTML.ListUnit = utils.CaserneUser(currentUser.User_id, currentUser.ID_House, database)
						sendHTML.ListInscripted = utils.SendStatGvG(database)

					case "/api/home/":
						// Rien à ajouter

					default:
						// Ne rien faire
					}

					if currentUser.Gestionnaire { // If user has the right to modify
						switch r.URL.Path {
						// --------------------------------------------------
						// ------------- Création des groupe GvG ------------
						// --------------------------------------------------
						case "/api/creategroup/":
							sendHTML.ListInscripted = utils.ListInscriptedUsers(id_House, database)
							sendHTML.ListUnit = utils.CaserneUser(currentUser.User_id, currentUser.ID_House, database)
							sendHTML.GroupGvG = utils.GroupGvG(database, "GroupGvG"+id_House)
							sendHTML.NameGroupGvG = utils.NameGroupGvG(database, id_House)

						case "/api/saveGroupInDB/":
							utils.SaveCreateGroup(r, id_House, database)

						case "/api/chargergrouptypeatt/":
							sendHTML.ListInscripted = utils.ListInscriptedUsers(id_House, database)
							sendHTML.GroupGvG = utils.GroupGvG(database, "GroupTypeAtt"+id_House)
							sendHTML.NameGroupGvG = utils.NameGroupGvG(database, id_House)

						case "/api/chargergrouptypedef/":
							sendHTML.ListInscripted = utils.ListInscriptedUsers(id_House, database)
							sendHTML.GroupGvG = utils.GroupGvG(database, "GroupTypeDef"+id_House)
							sendHTML.NameGroupGvG = utils.NameGroupGvG(database, id_House)

						// --------------------------------------------------
						// ----------------- Statistique GvG ----------------
						// --------------------------------------------------
						case "/api/statGvG/":
							sendHTML.ListInscripted = utils.SendStatGvG(database)

						// --------------------------------------------------
						// ------------ Accès caserne utilisateur -----------
						// --------------------------------------------------
						case "/api/consulcaserne/":
							sendHTML.ListUnit = utils.CaserneUser(currentUser.User_id, currentUser.ID_House, database)
							sendHTML.ListInscripted = utils.AllCaserne(id_House, database)

						case "/api/majspecificcaserne/":
							if r.Method == "POST" {
								utils.MAJCaserne(r, "0", id_House, database)
								gestion.Redirect = "/consulcaserne"
							} else {
								return
							}

						default:
							// Ne rien faire
						}
					}

					if currentUser.Admin {
						switch r.URL.Path {
						// --------------------------------------------------
						// --------- Administrateur du site internet --------
						// --------------------------------------------------
						case "/api/adminitrateBot/":
							utils.UploadInformationsBot(r, database)

						case "/api/UpdateAdmin/":
							utils.UpdateAdministration(r, database)

						default:
							// Ne rien faire
						}
					}
				}
				sendHTML.Gestion = *gestion
			}
		} else { // No cookie
			utils.Logout(w, r, database)
			gestion := &data.Gestion{
				Logged:   false,
				Redirect: "/",
			}
			sendHTML = &data.SendHTML{
				Gestion: *gestion,
			}
		}

		// fmt.Println("sendHTML : ", sendHTML)
		// Sending reply
		jsonData, err := json.Marshal(sendHTML)
		if err != nil {
			fmt.Println(err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)
	}
}

// ---------------------------------------------------------------------------
// .█████  ██████  ██████      ███    ███  ██████  ██████  ██ ██      ███████
// ██   ██ ██   ██ ██   ██     ████  ████ ██    ██ ██   ██ ██ ██      ██
// ███████ ██████  ██████      ██ ████ ██ ██    ██ ██████  ██ ██      █████
// ██   ██ ██      ██          ██  ██  ██ ██    ██ ██   ██ ██ ██      ██
// ██   ██ ██      ██          ██      ██  ██████  ██████  ██ ███████ ███████
// ---------------------------------------------------------------------------

func AppMobileHandler(w http.ResponseWriter, r *http.Request) {
	// en-têtes CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		// Répondre aux requêtes OPTIONS (pré-vol)
		w.WriteHeader(http.StatusOK)
		return
	}

	if tb.Request(1) {
		// Open database
		database, errdb := sql.Open("sqlite3", data.ADRESS_DB)
		utils.CheckErr("open db in homehandler", errdb)
		defer database.Close()

		// Récupération des informations du post
		var userInfo data.UserInfo
		errjson := json.NewDecoder(r.Body).Decode(&userInfo)
		utils.CheckErr("Erreur de décodage JSON CheckUserApp", errjson)

		// fmt.Println("\nr.URL.Path :", r.URL.Path)
		// fmt.Println("userInfo reçu :\n", userInfo)

		userID, id_House, langage, exit, officier := appmobile.UserInfoApp(userInfo.CodeApp, database)
		var sendHTML = &data.SendHTML{
			House: appmobile.GetHouseApp(id_House, database),
		}

		if exit {
			gestion := &data.Gestion{
				Logged:      true,
				Officier:    officier,
				BotActivate: utils.BotActivation(id_House, database),
			}

			switch r.URL.Path {
			case "/app/login":
				gestion.ListClass = utils.ListClass(database)
				sendHTML.Gestion = *gestion
				sendHTML.UserInfo = appmobile.CharactercardApp(userInfo.CodeApp, true, database)

			case "/app/user":
				gestion.ListClass = utils.ListClass(database)
				sendHTML.Gestion = *gestion
				sendHTML.UserInfo = appmobile.CharactercardApp(userInfo.CodeApp, false, database)

			case "/app/setting":
				appmobile.UpdateSetting(userInfo, database)

			case "/app/caserne":
				sendHTML.Gestion = *gestion
				sendHTML.ListUnit = utils.CaserneUser(userID, id_House, database)
				sendHTML.UserInfo = appmobile.CharactercardApp(userInfo.CodeApp, false, database)

			case "/app/updatecharactercard":
				// Mise a jour personnage
				gestion.Valid = appmobile.UpdateCharacterApp(userInfo, database)

				// retour nouvelle information
				sendHTML.Gestion = *gestion
				// sendHTML.UserInfo = appmobile.CharactercardApp(userInfo.CodeApp, false, database)

			case "/app/updateinscription":
				gestion.Valid = appmobile.UpdateInscription(userInfo, database)
				// sendHTML.UserInfo = appmobile.CharactercardApp(userInfo.CodeApp, false, database)
				sendHTML.Gestion = *gestion

			default:
				fmt.Println("Error r.URL.Path in AppMobileHandler (handlers line 299) : ", r.URL.Path)
			}

			// Ajout du language systématique
			sendHTML.UserInfo.Language = langage

		} else {
			gestion := &data.Gestion{
				Logged: false,
			}
			sendHTML = &data.SendHTML{
				Gestion: *gestion,
			}
		}

		// Sending reply
		jsonData, err := json.Marshal(sendHTML)
		if err != nil {
			fmt.Println(err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)
	}
}

// Maj de la caserne
func AppMajCaserneHandler(w http.ResponseWriter, r *http.Request) {
	// en-têtes CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		// Répondre aux requêtes OPTIONS (pré-vol)
		w.WriteHeader(http.StatusOK)
		return
	}

	if tb.Request(1) {
		// Open database
		database, errdb := sql.Open("sqlite3", data.ADRESS_DB)
		utils.CheckErr("open db in homehandler", errdb)
		defer database.Close()

		if r.Method == "POST" && r.URL.Path == "/app/updatecaserne" {

			var newCaserne data.ChangeUnitCaserne
			err := json.NewDecoder(r.Body).Decode(&newCaserne)
			utils.CheckErr("Erreur de décodage JSON MAJCaserne", err)
			// fmt.Println("newCaserne reçu : ", newCaserne)

			// Mise à jour caserne
			appmobile.UpdateAppCaserne(newCaserne, database)
		}
	}
}
