package utils

import (
	data "botgvg/internal"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

func SaveCreateGroup(r *http.Request, id_House string, database *sql.DB) (notif data.Notif) {
	notif.Type = "success"
	notif.Notif = true

	var listGroup data.SaveGroup
	err := json.NewDecoder(r.Body).Decode(&listGroup)
	CheckErr("Erreur de décodage JSON SaveCreateGroup", err)

	// Optiontype possible : "current" "SaveGroupTypeAtt" "SaveGroupTypeDef"
	var requestDeleteDB, requestInsertDB string
	switch listGroup.Optiontype {
	case "current":
		requestDeleteDB = fmt.Sprintf("DELETE FROM GroupGvG%s", id_House)
		requestInsertDB = fmt.Sprintf("INSERT INTO GroupGvG%s (User_ID,GroupNumber,Unit1,Unit2,Unit3,Unit4) Values(?,?,?,?,?,?)", id_House)

		notif.Content = data.ListLanguage{
			FR: "Les groupes ont été enregistrés avec succès.",
			EN: "The groups have been successfully registered.",
		}
	case "SaveGroupTypeAtt":
		requestDeleteDB = fmt.Sprintf("DELETE FROM GroupTypeAtt%s", id_House)
		requestInsertDB = fmt.Sprintf("INSERT INTO GroupTypeAtt%s (User_ID,GroupNumber,Unit1,Unit2,Unit3,Unit4) Values(?,?,?,?,?,?)", id_House)

		notif.Content = data.ListLanguage{
			FR: "Les groupes ont été enregistrés avec succès en tant que groupe type attaque.",
			EN: "The groups have been successfully registered as standard attack groups.",
		}
	case "SaveGroupTypeDef":
		requestDeleteDB = fmt.Sprintf("DELETE FROM GroupTypeDef%s", id_House)
		requestInsertDB = fmt.Sprintf("INSERT INTO GroupTypeDef%s (User_ID,GroupNumber,Unit1,Unit2,Unit3,Unit4) Values(?,?,?,?,?,?)", id_House)

		notif.Content = data.ListLanguage{
			FR: "Les groupes ont été enregistrés avec succès en tant que groupe type défense.",
			EN: "The groups have been successfully registered as defence groups.",
		}
	default:
		fmt.Println("Probléme 'Optiontype' saveDB")
		notif.Type = "error"
		notif.Content = data.ListLanguage{
			FR: "Erreur 500: probléme au niveau du serveur",
			EN: "Error 500: server problem",
		}
		return notif
	}

	// Update List Group GvG
	stmt1, errdb := database.Prepare(requestDeleteDB)
	CheckErr("1- DELETE - Requete DB SaveCreateGroup", errdb)
	stmt1.Exec()

	for i := 1; i < len(listGroup.ListGroup); i++ {
		currentline := listGroup.ListGroup[i]
		currentLength := len(currentline.UserToSave)
		if currentLength > 1 {
			var unit1, unit2, unit3, unit4 string
			if currentLength == 5 {
				unit1 = currentline.UserToSave[1]
				unit2 = currentline.UserToSave[2]
				unit3 = currentline.UserToSave[3]
				unit4 = currentline.UserToSave[4]
			} else if currentLength == 4 {
				unit1 = currentline.UserToSave[1]
				unit2 = currentline.UserToSave[2]
				unit3 = currentline.UserToSave[3]
				unit4 = ""
			} else if currentLength == 3 {
				unit1 = currentline.UserToSave[1]
				unit2 = currentline.UserToSave[2]
				unit3 = ""
				unit4 = ""
			} else if currentLength == 2 {
				unit1 = currentline.UserToSave[1]
				unit2 = ""
				unit3 = ""
				unit4 = ""
			} else if currentLength == 1 {
				unit1 = ""
				unit2 = ""
				unit3 = ""
				unit4 = ""
			}

			// check des unités identiques
			if unit4 == unit3 || unit4 == unit2 || unit4 == unit1 {
				unit4 = ""
			}
			if unit3 == unit2 || unit3 == unit1 {
				unit3 = ""
			}
			if unit2 == unit1 {
				unit2 = ""
			}

			username_ID := 0
			stmtUsers, errdb := database.Prepare("SELECT ID FROM Users WHERE DiscordName = ? AND ID_House = ?;")
			CheckErr("1- Requete DB SaveCreateGroup", errdb)
			stmtUsers.QueryRow(currentline.UserToSave[0], id_House).Scan(&username_ID)

			if username_ID != 0 {
				groupNumber := strings.Replace(currentline.NameGroup, "group", "", 1)
				stmt2, errdb := database.Prepare(requestInsertDB)
				CheckErr("2- INSERT - Requete DB SaveCreateGroup", errdb)
				stmt2.Exec(username_ID, groupNumber, unit1, unit2, unit3, unit4)

			}
		}
	}

	// update NameGroup
	if len(listGroup.Namegroup) > 0 && len(listGroup.Namegroup[0]) > 0 {
		// fmt.Println("listGroup : ", listGroup.Namegroup)
		for _, arrayGroup := range listGroup.Namegroup {
			currentID := 0
			requeststmtID := fmt.Sprintf("SELECT ID FROM NameGroupGvG%s WHERE GroupNumber = ?", id_House)
			stmtID, errdb := database.Prepare(requeststmtID)
			if errdb != sql.ErrNoRows {
				CheckErr("1- Requete DB SELECT NameGroup (exist ?)", errdb)
			}
			stmtID.QueryRow(arrayGroup[0]).Scan(&currentID)

			if currentID == 0 { // nom de groupe non existant
				requeststmtNotExist := fmt.Sprintf("INSERT INTO NameGroupGvG%s (GroupNumber,NameGroup) Values(?,?)", id_House)
				stmtNotExist, errdb := database.Prepare(requeststmtNotExist)
				CheckErr("2- Requete DB  INSERT NameGroup", errdb)
				stmtNotExist.Exec(arrayGroup[0], arrayGroup[1])
			} else { // nom de groupe existant
				requeststmtExist := fmt.Sprintf("UPDATE NameGroupGvG%s SET NameGroup = ? WHERE GroupNumber = ?", id_House)
				stmtExist, errdb := database.Prepare(requeststmtExist)
				CheckErr("2- Requete DB  update NameGroup", errdb)
				stmtExist.Exec(arrayGroup[1], arrayGroup[0])
			}
		}
	}

	return notif
}
