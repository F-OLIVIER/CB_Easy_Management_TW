package utils

import (
	"database/sql"
	data "easemanagementtw/internal"
	"encoding/json"
	"fmt"
	"net/http"
)

func Settingbot(id_House string, database *sql.DB) (setting data.SettingBot) {
	house, err := database.Prepare(`SELECT House_name, House_logo, Langage, ID_Group_Users, ID_Group_Officier, ID_Chan_GvG, ID_Chan_Gestion, ID_Chan_Users, Late, Recall_GvG, Allumage FROM Houses WHERE ID = ?;`)
	CheckErr("1- Requete DB fonction AllCaserne", err)
	house.QueryRow(id_House).Scan(&setting.House_name, &setting.House_logo, &setting.Langage, &setting.ID_Group_Users, &setting.ID_Group_Officier, &setting.ID_Chan_GvG, &setting.ID_Chan_Gestion, &setting.ID_Chan_Users, &setting.Late, &setting.Recall_GvG, &setting.Allumage)
	return setting
}

func UpdateSettingbot(r *http.Request, id_user, id_House string, database *sql.DB) (notif data.Notif) {
	var newSetting data.SettingBot
	err := json.NewDecoder(r.Body).Decode(&newSetting)
	CheckErr("Erreur de décodage JSON UpdateSettingbot", err)

	notif.Type = "success"
	notif.Notif = true
	notif.Content = data.ListLanguage{
		FR: "Mise à jour des paramètres du bot effectué avec succès.",
		EN: "Bot settings successfully updated.",
	}

	modif := 0
	if newSetting.House_name != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET House_name = ? WHERE ID = ?;`)
		if err != nil {
			CheckErr("Update House_name UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.House_name, id_House)
			if err != nil {
				CheckErr("Exec House_name UpdateSettingbot", err)
			} else {
				LogFile("Mise à jour House_name maison = " + *newSetting.House_name + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	if newSetting.Langage != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET Langage = ? WHERE ID = ?;`)
		CheckErr("Update Langage UpdateSettingbot ", err)
		if err != nil {
			CheckErr("Update Langage UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.Langage, id_House)
			if err != nil {
				CheckErr("Exec Langage UpdateSettingbot", err)
			} else {
				LogFile("Mise à jour Langage maison = " + *newSetting.Langage + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	if newSetting.ID_Group_Users != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET ID_Group_Users = ? WHERE ID = ?;`)
		CheckErr("Update ID_Group_Users UpdateSettingbot ", err)
		if err != nil {
			CheckErr("Update ID_Group_Users UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.ID_Group_Users, id_House)
			if err != nil {
				CheckErr("Exec ID_Group_Users UpdateSettingbot", err)
			} else {
				LogFile("Mise à jour ID_Group_Users maison = " + *newSetting.ID_Group_Users + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	if newSetting.ID_Group_Officier != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET ID_Group_Officier = ? WHERE ID = ?;`)
		CheckErr("Update ID_Group_Officier UpdateSettingbot ", err)
		if err != nil {
			CheckErr("Update ID_Group_Officier UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.ID_Group_Officier, id_House)
			if err != nil {
				CheckErr("Exec ID_Group_Officier UpdateSettingbot", err)
			} else {
				LogFile("Mise à jour ID_Group_Officier maison = " + *newSetting.ID_Group_Officier + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	ID_Chan_GvG := "-1"
	if newSetting.ID_Chan_GvG != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET ID_Chan_GvG = ? WHERE ID = ?;`)
		CheckErr("Update ID_Chan_GvG UpdateSettingbot ", err)
		if err != nil {
			CheckErr("Update ID_Chan_GvG UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.ID_Chan_GvG, id_House)
			if err != nil {
				CheckErr("Exec ID_Chan_GvG UpdateSettingbot", err)
			} else {
				ID_Chan_GvG = *newSetting.ID_Chan_GvG
				LogFile("Mise à jour ID_Chan_GvG maison = " + *newSetting.ID_Chan_GvG + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	if newSetting.ID_Chan_Gestion != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET ID_Chan_Gestion = ? WHERE ID = ?;`)
		CheckErr("Update ID_Chan_Gestion UpdateSettingbot ", err)
		if err != nil {
			CheckErr("Update ID_Chan_Gestion UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.ID_Chan_Gestion, id_House)
			if err != nil {
				CheckErr("Exec ID_Chan_Gestion UpdateSettingbot", err)
			} else {
				LogFile("Mise à jour ID_Chan_Gestion maison = " + *newSetting.ID_Chan_Gestion + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	if newSetting.ID_Chan_Users != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET ID_Chan_Users = ? WHERE ID = ?;`)
		CheckErr("Update ID_Chan_Users UpdateSettingbot ", err)
		if err != nil {
			CheckErr("Update ID_Chan_Users UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.ID_Chan_Users, id_House)
			if err != nil {
				CheckErr("Exec ID_Chan_Users UpdateSettingbot", err)
			} else {
				LogFile("Mise à jour ID_Chan_Users maison = " + *newSetting.ID_Chan_Users + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	if newSetting.Late != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET Late = ? WHERE ID = ?;`)
		CheckErr("Update Late UpdateSettingbot ", err)
		if err != nil {
			CheckErr("Update Late UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.Late, id_House)
			if err != nil {
				CheckErr("Exec Late UpdateSettingbot", err)
			} else {
				LogFile("Mise à jour Late maison = " + fmt.Sprintf("%d", *newSetting.Late) + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	if newSetting.Recall_GvG != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET Recall_GvG = ? WHERE ID = ?;`)
		CheckErr("Update Recall_GvG UpdateSettingbot ", err)
		if err != nil {
			CheckErr("Update Recall_GvG UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.Recall_GvG, id_House)
			if err != nil {
				CheckErr("Exec Recall_GvG UpdateSettingbot", err)
			} else {
				LogFile("Mise à jour Recall_GvG maison = " + fmt.Sprintf("%d", *newSetting.Recall_GvG) + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	Allumage := "-1"
	if newSetting.Allumage != nil {
		stmt, err := database.Prepare(`UPDATE Houses SET Allumage = ? WHERE ID = ?;`)
		CheckErr("Update Allumage UpdateSettingbot ", err)
		if err != nil {
			CheckErr("Update Allumage UpdateSettingbot ", err)
		} else {
			defer stmt.Close()
			_, err := stmt.Exec(*newSetting.Allumage, id_House)
			if err != nil {
				CheckErr("Exec Allumage UpdateSettingbot", err)
			} else {
				Allumage = fmt.Sprintf("%d", *newSetting.Allumage) // 0 = on, 1 = off
				LogFile("Mise à jour Allumage maison = " + Allumage + " (id_House = " + id_House + ")")
				modif++
			}
		}
	}

	if modif == 0 {
		notif.Type = "error"
		notif.Content = data.ListLanguage{
			FR: "Erreur 500: probléme au niveau du serveur",
			EN: "Error 500: server problem",
		}
	}

	if notif.Type == "success" {

		var ID_Server, Langage, DiscordID_user string
		// Info maison
		houseStmt, err := database.Prepare(`SELECT ID_Server, Langage FROM Houses WHERE ID = ?;`)
		CheckErr("1- Requete DB fonction UpdateSettingbot (houseStmt)", err)
		defer houseStmt.Close()
		err = houseStmt.QueryRow(id_House).Scan(&ID_Server, &Langage)
		CheckErr("1- Scan DB fonction UpdateSettingbot (houseStmt)", err)

		// Info utilisateur
		userStmt, err := database.Prepare(`SELECT DiscordID FROM Users WHERE ID = ?;`)
		CheckErr("1- Requete DB fonction UpdateSettingbot (userStmt)", err)
		defer userStmt.Close()
		err = userStmt.QueryRow(id_user).Scan(&DiscordID_user)
		CheckErr("1- Scan DB fonction UpdateSettingbot (userStmt)", err)

		msgDiscord := ""
		if Langage == "fr" {
			msgDiscord = "<@" + DiscordID_user + "> a mis à jour les paramètres du bot Discord via le site internet."
		} else {
			msgDiscord = "<@" + DiscordID_user + "> updated the Discord bot's settings via the website."
		}
		message := data.SocketMessage{
			Type: "update_setting_bot",
			Content: map[string]string{
				"ID_Server":   ID_Server,
				"ID_Chan_GvG": ID_Chan_GvG,
				"msgDiscord":  msgDiscord,
				"Allumage":    Allumage,
			},
		}
		SendMessage(message)
		msg := DiscordID_user + " du serveur " + id_House + " a mis à jour les paramètres du bot Discord via le site internet."
		LogFile(msg)
	}

	return notif
}
