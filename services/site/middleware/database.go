package utils

import (
	data "botgvg/internal"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	_ "github.com/mattn/go-sqlite3"
)

// Fonction qui récupérer les informations utilisateur à partir de son uuid
func UserInfo(uuid string, database *sql.DB) (users []data.ScearchUserInfo, list_houses []data.Houses) {
	if uuid != "" {
		query := "SELECT ID, ID_House, DiscordID, DiscordName, DiscordRole, DiscordPhoto, userLangage, userAdmin FROM Users WHERE uuid = ?"
		rows, err := database.Query(query, uuid)
		CheckErr("Requête DB UserInfo", err)
		defer rows.Close()

		for rows.Next() {
			var user data.ScearchUserInfo
			var DiscordRole, DiscordID, userAdmin string
			err := rows.Scan(&user.User_id, &user.ID_House, &DiscordID, &user.DiscordUsername, &DiscordRole, &user.DiscordPhoto, &user.Language, &userAdmin)
			CheckErr("Erreur lors du scan des résultats", err)

			user.Admin = (userAdmin == "1")
			user.Gestionnaire = (DiscordRole == "Officier")
			if DiscordID == data.OWNER {
				user.Owner = true
			}

			users = append(users, user)
		}

		list_houses = get_user_house(uuid, database)
	}
	return users, list_houses
}

func SpecificUserInfo(userID string, database *sql.DB) (username string) {
	if userID != "" {
		stmt, errdb := database.Prepare("SELECT DiscordName FROM Users WHERE ID = ?")
		CheckErr("1- Requete DB SpecificUserInfo", errdb)
		stmt.QueryRow(userID).Scan(&username)
	}
	return username
}

// Récupére l'ID du/des server discord de l'utilisateur
func get_user_house(uuid string, database *sql.DB) (list_houses []data.Houses) {
	listhouse, err := database.Prepare(`SELECT Houses.ID, Houses.House_name, Houses.House_logo, Houses.Langage, Houses.ID_Server 
										FROM Houses 
										INNER JOIN Users ON Houses.ID = Users.ID_House
										WHERE uuid = ?;`)
	CheckErr("1- Requete DB fonction Get_user_house", err)
	rows, err := listhouse.Query(uuid)
	CheckErr("2- Requete DB fonction Get_user_house", err)
	for rows.Next() {
		var house data.Houses
		err = rows.Scan(&house.ID, &house.House_name, &house.House_logo, &house.Langage, &house.ID_Server)
		CheckErr("3- Requete DB fonction Get_user_house", err)

		list_houses = append(list_houses, house)
	}

	return list_houses
}

func Charactercard(uuid string, database *sql.DB) (userInfo data.UserInfo) {
	stmt1, errdb := database.Prepare("SELECT ID, DiscordName, DiscordRole, DiscordPhoto, GameCharacter_ID, Lvl, Influence, EtatInscription, NbGvGParticiped, NbTotalGvG, DateLastGvGParticiped_FR, DateLastGvGParticiped_EN, userLangage FROM Users WHERE uuid = ?")
	CheckErr("1- Requete DB UserInfo", errdb)
	var DiscordRole string
	stmt1.QueryRow(uuid).Scan(&userInfo.ID, &userInfo.DiscordUsername, &DiscordRole, &userInfo.DiscordPhoto, &userInfo.GameCharacter_ID, &userInfo.Lvl, &userInfo.Influence, &userInfo.EtatInscription, &userInfo.NbGvGParticiped, &userInfo.NbTotalGvG, &userInfo.DateLastGvGParticiped.FR, &userInfo.DateLastGvGParticiped.EN, &userInfo.Language)

	if userInfo.GameCharacter_ID != 0 {
		stmt2, errdb := database.Prepare("SELECT ClasseFR, ClasseEN FROM ListGameCharacter WHERE ID = ?")
		CheckErr("2- Requete DB UserInfo", errdb)
		stmt2.QueryRow(userInfo.GameCharacter_ID).Scan(&userInfo.GameCharacter.FR, &userInfo.GameCharacter.EN)
	} else {
		userInfo.GameCharacter.FR = "Non sélectionné"
		userInfo.GameCharacter.EN = "Not selected"

	}

	if DiscordRole == "Officier" {
		return userInfo
	}
	return userInfo
}

func UpdateCharacter(r *http.Request, currentUser data.ScearchUserInfo, database *sql.DB) (notif data.Notif) {
	var newUserInfo data.UserInfo
	err := json.NewDecoder(r.Body).Decode(&newUserInfo)
	CheckErr("Erreur de décodage JSON UpdateCharacter", err)

	// fmt.Println("newUserInfo : ", newUserInfo)

	if newUserInfo.GameCharacter.FR != "" {
		stmt1, errdb := database.Prepare("SELECT ID FROM ListGameCharacter WHERE ClasseFR = ?")
		CheckErr("1- Requete DB UpdateCharacter", errdb)
		stmt1.QueryRow(newUserInfo.GameCharacter.FR).Scan(&newUserInfo.GameCharacter_ID)
	}

	if newUserInfo.Influence != "" && newUserInfo.Lvl != "" && newUserInfo.GameCharacter.FR != "" {
		// les 3 sont saisies (Class + Lvl + Influence)
		stmt2, errdb := database.Prepare("UPDATE Users SET GameCharacter_ID = ?, Lvl = ?, Influence = ? WHERE ID = ?")
		CheckErr("2- Requete DB UpdateCharacter", errdb)
		stmt2.Exec(newUserInfo.GameCharacter_ID, newUserInfo.Lvl, newUserInfo.Influence, currentUser.User_id)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre influence, level et arme ont été mis à jour avec succès.",
			EN: "Your influence, level and weapon have been successfully updated.",
		}
	} else if newUserInfo.Influence != "" && newUserInfo.Lvl != "" {
		// Lvl + Influence
		stmt2, errdb := database.Prepare("UPDATE Users SET Lvl = ?, Influence = ? WHERE ID = ?")
		CheckErr("3- Requete DB UpdateCharacter", errdb)
		stmt2.Exec(newUserInfo.Lvl, newUserInfo.Influence, currentUser.User_id)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre influence et level ont été mis à jour avec succès.",
			EN: "Your influence and level have been successfully updated.",
		}
	} else if newUserInfo.Influence != "" && newUserInfo.GameCharacter.FR != "" {
		// Class + Influence
		stmt2, errdb := database.Prepare("UPDATE Users SET GameCharacter_ID = ?, Influence = ? WHERE ID = ?")
		CheckErr("4- Requete DB UpdateCharacter", errdb)
		stmt2.Exec(newUserInfo.GameCharacter_ID, newUserInfo.Influence, currentUser.User_id)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre influence et arme ont été mis à jour avec succès.",
			EN: "Your influence and weapon have been successfully updated.",
		}
	} else if newUserInfo.Lvl != "" && newUserInfo.GameCharacter.FR != "" {
		// Class + Lvl
		stmt2, errdb := database.Prepare("UPDATE Users SET GameCharacter_ID = ?, Lvl = ? WHERE ID = ?")
		CheckErr("5- Requete DB UpdateCharacter", errdb)
		stmt2.Exec(newUserInfo.GameCharacter_ID, newUserInfo.Lvl, currentUser.User_id)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre level et arme ont été mis à jour avec succès.",
			EN: "Your level and weapon have been successfully updated.",
		}
	} else if newUserInfo.GameCharacter.FR != "" {
		// Class
		stmt2, errdb := database.Prepare("UPDATE Users SET GameCharacter_ID = ? WHERE ID = ?")
		CheckErr("6- Requete DB UpdateCharacter", errdb)
		stmt2.Exec(newUserInfo.GameCharacter_ID, currentUser.User_id)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre arme a été mis à jour avec succès.",
			EN: "Your weapon has been successfully updated.",
		}
	} else if newUserInfo.Lvl != "" {
		// Lvl
		stmt2, errdb := database.Prepare("UPDATE Users SET Lvl = ? WHERE ID = ?")
		CheckErr("7- Requete DB UpdateCharacter", errdb)
		stmt2.Exec(newUserInfo.Lvl, currentUser.User_id)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre level a été mis à jour avec succès.",
			EN: "Your level has been successfully updated.",
		}
	} else if newUserInfo.Influence != "" {
		// Influence
		stmt2, errdb := database.Prepare("UPDATE Users SET Influence = ? WHERE ID = ?")
		CheckErr("8- Requete DB UpdateCharacter", errdb)
		stmt2.Exec(newUserInfo.Influence, currentUser.User_id)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre influence a été mis à jour avec succès.",
			EN: "Your influence has been successfully updated.",
		}
	} else {
		notif.Type = "error"
		notif.Content = data.ListLanguage{
			FR: "Erreur 500: probléme au niveau du serveur",
			EN: "Error 500: server problem",
		}
	}

	if newUserInfo.EtatInscription == 1 || newUserInfo.EtatInscription == 3 { // 1: s'incrit present, 3: s'inscrit absent
		stmt3, errdb := database.Prepare("UPDATE Users SET EtatInscription = ? WHERE ID = ?")
		CheckErr("9- Requete DB UpdateCharacter", errdb)
		stmt3.Exec(newUserInfo.EtatInscription, currentUser.User_id)

		notif.Type = "success"
		if newUserInfo.EtatInscription == 1 {
			notif.Content = data.ListLanguage{
				FR: "Vous êtes inscrit présent pour la prochaine guerre de territoire.",
				EN: "You are registered present for the next territorial war.",
			}
		} else if newUserInfo.EtatInscription == 3 {
			notif.Content = data.ListLanguage{
				FR: "Vous êtes inscrit absent pour la prochaine guerre de territoire.",
				EN: "You are registered absent for the next territorial war.",
			}
		}
	}

	notif.Notif = true
	return notif
}

func ListInscriptedUsers(id_House string, database *sql.DB) (UsersIncripted []data.UserInfo) {
	listUnit, err := database.Prepare(`SELECT ID, ID_House, GameCharacter_ID, DiscordName, Lvl, Influence, NbGvGParticiped, DateLastGvGParticiped_FR, DateLastGvGParticiped_EN
										FROM Users
										WHERE Users.EtatInscription = 1 AND ID_House = ?;
										`)
	CheckErr("1- Requete DB fonction ListInscriptedusers", err)
	rows, err := listUnit.Query(id_House)
	CheckErr("2- Requete DB fonction ListInscriptedusers", err)
	for rows.Next() {
		var user data.UserInfo
		err = rows.Scan(&user.ID, &user.ID_House, &user.GameCharacter_ID, &user.DiscordUsername, &user.Lvl, &user.Influence, &user.NbGvGParticiped, &user.DateLastGvGParticiped.FR, &user.DateLastGvGParticiped.EN)
		CheckErr("3- Requete DB fonction ListInscriptedusers", err)

		if user.GameCharacter_ID != 0 {
			class, errdb := database.Prepare("SELECT ClasseFR, ClasseEN FROM ListGameCharacter WHERE ID = ?")
			CheckErr("Requete DB UserInfo", errdb)
			class.QueryRow(user.GameCharacter_ID).Scan(&user.GameCharacter.FR, &user.GameCharacter.EN)
		}
		listUnitUser := CaserneUser(strconv.Itoa(user.ID), id_House, database)
		var newListunitUser []data.Unit
		for i := 0; i < len(listUnitUser); i++ {
			if listUnitUser[i].Lvl != "" {
				newListunitUser = append(newListunitUser, listUnitUser[i])
			}
		}
		user.UserCaserne = newListunitUser
		UsersIncripted = append(UsersIncripted, user)
	}

	// fmt.Println("UsersIncripted : \n", UsersIncripted)
	return UsersIncripted
}

func AllCaserne(id_House string, database *sql.DB) (ListInscripted []data.UserInfo) {
	listUnit, err := database.Prepare(`SELECT ID, DiscordName, Lvl, Influence FROM Users WHERE ID_House = ?;`)
	CheckErr("1- Requete DB fonction AllCaserne", err)
	rows, err := listUnit.Query(id_House)
	CheckErr("2- Requete DB fonction AllCaserne", err)
	for rows.Next() {
		var user data.UserInfo
		err = rows.Scan(&user.ID, &user.DiscordUsername, &user.Lvl, &user.Influence)
		CheckErr("3- Requete DB fonction AllCaserne", err)

		listUnitUser := CaserneUser(strconv.Itoa(user.ID), id_House, database)
		var newListunitUser []data.Unit
		for i := 0; i < len(listUnitUser); i++ {
			if listUnitUser[i].Lvl == "" {
				listUnitUser[i].Lvl = "0"
			}
			newListunitUser = append(newListunitUser, listUnitUser[i])
		}
		user.UserCaserne = newListunitUser
		ListInscripted = append(ListInscripted, user)
	}

	// fmt.Println("ListInscripted : \n", ListInscripted)
	return ListInscripted
}

func GroupGvG(database *sql.DB, nameTable string) (listUserAlreadyRegistered []data.UserGvG) {
	listUnit, err := database.Prepare("SELECT User_ID, GroupNumber, Unit1, Unit2, Unit3, Unit4 FROM " + nameTable)
	CheckErr("1- Requete DB fonction GroupGvG", err)
	rows, err := listUnit.Query()
	CheckErr("2- Requete DB fonction GroupGvG", err)
	for rows.Next() {
		var user data.UserGvG
		err = rows.Scan(&user.User_ID, &user.GroupNumber, &user.Unit1, &user.Unit2, &user.Unit3, &user.Unit4)
		CheckErr("3- Requete DB fonction GroupGvG", err)

		stmt, errdb := database.Prepare("SELECT DiscordName FROM Users WHERE ID = ?")
		CheckErr("4- Requete DB fonction GroupGvG", errdb)
		stmt.QueryRow(user.User_ID).Scan(&user.Username)

		listUserAlreadyRegistered = append(listUserAlreadyRegistered, user)
	}

	return listUserAlreadyRegistered
}

func NameGroupGvG(database *sql.DB, id_House string) map[int]string {
	listNameGroup := make(map[int]string)
	query := `SELECT GroupNumber, NameGroup FROM NameGroupGvG` + id_House
	listName, err := database.Prepare(query)
	CheckErr("1- Requete DB fonction NameGroupGvG", err)
	rows, err := listName.Query()
	CheckErr("2- Requete DB fonction NameGroupGvG", err)
	for rows.Next() {
		var GroupNumber int
		var NameGroup string
		err = rows.Scan(&GroupNumber, &NameGroup)
		CheckErr("3- Requete DB fonction NameGroupGvG", err)
		listNameGroup[GroupNumber] = NameGroup
	}
	return listNameGroup
}

func ListClass(database *sql.DB) (listClass []data.ListLanguage) {
	stmtlistclass, err := database.Prepare(`SELECT ClasseFR, ClasseEN FROM ListGameCharacter;`)
	CheckErr("1- Requete DB fonction ListClass", err)
	rows, err := stmtlistclass.Query()
	CheckErr("2- Requete DB fonction ListClass", err)
	for rows.Next() {
		var currentclasse data.ListLanguage
		err = rows.Scan(&currentclasse.FR, &currentclasse.EN)
		CheckErr("3- Requete DB fonction ListClass", err)
		listClass = append(listClass, currentclasse)
	}
	return listClass
}

func BotActivation(id_House string, database *sql.DB) bool {
	usedcookie, errdb := database.Prepare("SELECT Allumage FROM Houses WHERE ID = ?")
	CheckErr("Requete DB UserInfo", errdb)
	var Allumage int
	usedcookie.QueryRow(id_House).Scan(&Allumage)

	if Allumage == 0 {
		return true
	} else {
		return false
	}
}

func UpdateLanguage(r *http.Request, id_user string, database *sql.DB) {
	var user_receive data.UserInfo
	err := json.NewDecoder(r.Body).Decode(&user_receive)
	CheckErr("Erreur de décodage JSON UpdateLanguage", err)

	stmt, errdb := database.Prepare("UPDATE Users SET userLangage = ? WHERE ID = ?")
	CheckErr("Requete DB UpdateLanguage", errdb)
	stmt.Exec(user_receive.Language, id_user)
}

func UpdateAdministration(r *http.Request, database *sql.DB) (notif data.Notif) {
	var datajson data.AdministrateBot
	err := json.NewDecoder(r.Body).Decode(&datajson)
	CheckErr("Erreur de décodage JSON SaveCreateGroup", err)

	if !datajson.Informationdiscord && datajson.NewWeapon.FR != "" && datajson.NewWeapon.EN != "" { // ajout d'une nouvelle arme de héros
		// insertion de la nouvelle arme dans la db
		stmt, err := database.Prepare(`INSERT INTO ListGameCharacter(ClasseFR, ClasseEN) VALUES(?,?);`)
		CheckErr("1- INSERT NewWeapon in UpdateAdministration ", err)
		stmt.Exec(datajson.NewWeapon.FR, datajson.NewWeapon.EN)
		message := data.SocketMessage{
			Type: "newclass",
			Content: map[string]string{
				"fr": datajson.NewWeapon.FR,
				"en": datajson.NewWeapon.EN,
			},
		}
		SendMessage(message)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Nouvelle arme ajoutée avec succès.",
			EN: "New weapon added successfully.",
		}

	} else if datajson.Informationdiscord && datajson.NewWeapon.FR != "" && datajson.NewWeapon.EN != "" {
		message := data.SocketMessage{
			Type: "informationdiscord",
			Content: map[string]string{
				"fr": datajson.NewWeapon.FR,
				"en": datajson.NewWeapon.EN,
			},
		}
		SendMessage(message)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Information Discord envoyé avec succès.",
			EN: "Discord information sent successfully.",
		}

	} else {
		notif.Type = "error"
		notif.Content = data.ListLanguage{
			FR: "Erreur 500: problème dans la mise à jour côté serveur.",
			EN: "Error 500: Problem in server-side update.",
		}
	}

	notif.Notif = true
	return notif
}

func UploadInformationsBot(r *http.Request, database *sql.DB) (notif data.Notif) {
	err := r.ParseMultipartForm(10 << 20) // 10 MB maximum
	if err == nil {
		// Récupérez les données JSON du formulaire
		jsonData := r.PostFormValue("data")
		if jsonData != "" {
			// Parsez les données JSON
			var formData data.AdministrateBot
			err = json.Unmarshal([]byte(jsonData), &formData)
			CheckErr("UploadInformationsBot: Erreur lors de la lecture des données JSON", err)
			// fmt.Println("formData : ", formData)

			file, header, err := r.FormFile("image")
			if err == nil {
				defer file.Close()
				UploadPicture(file, header, "./public/images/unit/"+header.Filename)
				if formData.CreateUnit.Name.FR != "" { // création d'une unité
					createNewUnit(formData.CreateUnit, "./img/unit/"+header.Filename, database)
					message := data.SocketMessage{
						Type: "newunit",
						Content: map[string]string{
							"fr": formData.CreateUnit.Name.FR,
							"en": formData.CreateUnit.Name.EN,
						},
					}
					SendMessage(message)

					notif.Content = data.ListLanguage{
						FR: "Unité crée avec succès",
						EN: "Unit created successfully.",
					}
				} else if formData.ChangeUnit.Name.FR != "" { // Update de l'image d'une unit
					updateImgUnit(formData.ChangeUnit, "./img/unit/"+header.Filename, database)
					notif.Content = data.ListLanguage{
						FR: "Unité mise à jour avec succès.",
						EN: "Unit updated successfully.",
					}
				}
			}

			if formData.ChangeUnit.LvlMax != "" || formData.ChangeUnit.Influence != "" || formData.ChangeUnit.Maitrise != "" || formData.ChangeUnit.Newunitname.EN != "" || formData.ChangeUnit.Newunitname.FR != "" || formData.ChangeUnit.Tier != "" || formData.ChangeUnit.Type.FR != "" { // Update des data d'une unit
				updateDataUnit(formData.ChangeUnit, database)
				notif.Content = data.ListLanguage{
					FR: "Unité mise à jour avec succès.",
					EN: "Unit updated successfully.",
				}
			}

			notif.Type = "success"
		} else {
			fmt.Println("UploadInformationsBot: Probléme dans la récupération des données JSON")
			notif.Type = "error"
			notif.Content = data.ListLanguage{
				FR: "Erreur 500: problème dans la mise à jour côté serveur.",
				EN: "Error 500: Problem in server-side update.",
			}
		}

	} else {
		CheckErr("UploadInformationsBot: Impossible de traiter le formulaire\n", err)
		notif.Type = "error"
		notif.Content = data.ListLanguage{
			FR: "Taille d'image trop grande.",
			EN: "Image size too large.",
		}
	}

	notif.Notif = true
	return notif
}

func createNewUnit(dataCreateUnit data.Unit, filepath string, database *sql.DB) {
	// Définir un délai d'attente pour éviter le verrouillage
	_, err := database.Exec("PRAGMA busy_timeout = 5000;") // 5 secondes de timeout
	CheckErr("PRAGMA busy_timeout", err)

	// Début de la transaction pour éviter les verrous concurrents
	tx, err := database.Begin()
	if err != nil {
		log.Fatal("Erreur lors du démarrage de la transaction:", err)
		return
	}
	defer tx.Commit() // Assurer que la transaction sera validée

	typeint := 0
	stmttype, errdb := database.Prepare("SELECT ID FROM ListTypeUnit WHERE TypeFR = ?;")
	CheckErr("1- Requete DB SpecificUserInfo", errdb)
	stmttype.QueryRow(dataCreateUnit.Type.FR).Scan(&typeint)

	if typeint != 0 {
		// Insertion de l'unité dans la table ListUnit
		stmt, err := tx.Prepare(`INSERT INTO ListUnit(UnitFR, UnitEN, InfuenceMax, LvlMax, Maitrise, TypeUnit, ForceUnit, Img) VALUES(?,?,?,?,?,?,?,?);`)
		CheckErr("1- INSERT createNewUnit ", err)
		defer stmt.Close()
		_, err = stmt.Exec(dataCreateUnit.Name.FR, dataCreateUnit.Name.EN, dataCreateUnit.Influence, dataCreateUnit.LvlMax, dataCreateUnit.Maitrise, typeint, dataCreateUnit.Tier, filepath)
		CheckErr("1- Exec createNewUnit ", err)

		// Recherche d'une table Caserne existante
		var tableName string
		rows, err := tx.Query(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Caserne%';`)
		CheckErr("2- SELECT name tables Caserne ", err)

		var nbColum int
		// Lire la première ligne seulement
		if rows.Next() {
			err = rows.Scan(&tableName)
			CheckErr("3- Scan nbColum createNewUnit", err)
			// Nombre de colonne -1 dans la table "Caserne" principale (base pour l'indexation des unités)
			queryNbColum := fmt.Sprintf("SELECT count(*) FROM pragma_table_info('%s');", tableName)
			err = tx.QueryRow(queryNbColum).Scan(&nbColum)
			CheckErr("3- nbColum createNewUnit ", err)
		}
		rows.Close()

		if nbColum > 0 {
			// Récupérer toutes les maisons dans la table Users
			list_maison, err := tx.Query(`SELECT ID FROM Houses;`)
			CheckErr("4- list_maison ", err)
			defer list_maison.Close()

			// Préparer les requêtes pour l'ajout de colonnes
			stmtColumCaserne := `ALTER TABLE Caserne%s ADD COLUMN %s INTEGER DEFAULT 0;`
			stmtColumCaserneMaitrise := `ALTER TABLE CaserneMaitrise%s ADD COLUMN %s INTEGER DEFAULT 0;`

			for list_maison.Next() {
				var current_ID_House string
				err = list_maison.Scan(&current_ID_House)
				CheckErr("4- Scan list_maison ", err)

				// Ajout de la colonne dans la table Caserne
				queryCaserne := fmt.Sprintf(stmtColumCaserne, current_ID_House, "Unit"+strconv.Itoa(nbColum-1))
				_, err = tx.Exec(queryCaserne)
				CheckErr("5- ALTER TABLE Caserne createNewUnit ", err)

				// Ajout de la colonne dans la table CaserneMaitrise
				queryCaserneMaitrise := fmt.Sprintf(stmtColumCaserneMaitrise, current_ID_House, "Unit"+strconv.Itoa(nbColum-1))
				_, err = tx.Exec(queryCaserneMaitrise)
				CheckErr("5- ALTER TABLE CaserneMaitrise createNewUnit ", err)
			}
		}
	}
}

func updateImgUnit(dataCreateUnit data.Unit, filepath string, database *sql.DB) {
	if dataCreateUnit.Name.FR != "" {
		stmt, err := database.Prepare(`UPDATE ListUnit SET Img = ? WHERE UnitFR = ?;`)
		CheckErr("Update Allumage ActivateOrNotBotInDB ", err)
		fmt.Println("filepath, dataCreateUnit.ID", filepath, dataCreateUnit.ID)
		stmt.Exec(filepath, dataCreateUnit.Name.FR)
	}
}

func updateDataUnit(dataCreateUnit data.Unit, database *sql.DB) {
	if dataCreateUnit.Influence != "" {
		stmt, err := database.Prepare(`UPDATE ListUnit SET InfuenceMax = ? WHERE UnitFR = ?;`)
		CheckErr("2- Update updateDataUnit ", err)
		stmt.Exec(dataCreateUnit.Influence, dataCreateUnit.Name.FR)
	}

	if dataCreateUnit.LvlMax != "" {
		stmt, err := database.Prepare(`UPDATE ListUnit SET LvlMax = ? WHERE UnitFR = ?;`)
		CheckErr("3- Update updateDataUnit ", err)
		stmt.Exec(dataCreateUnit.LvlMax, dataCreateUnit.Name.FR)
	}

	if dataCreateUnit.Maitrise != "" {
		stmtMaitrise, errdb := database.Prepare("SELECT Maitrise FROM ListUnit WHERE UnitFR = ?")
		CheckErr("4- Update Maitrise updateDataUnit", errdb)
		var currentMaitrise, newMaitrise int
		stmtMaitrise.QueryRow(dataCreateUnit.Name.FR).Scan(&currentMaitrise)
		if currentMaitrise == 0 {
			newMaitrise = 1
		} else {
			newMaitrise = 0
		}

		stmt, err := database.Prepare(`UPDATE ListUnit SET Maitrise = ? WHERE UnitFR = ?;`)
		CheckErr("5- Update Maitrise updateDataUnit ", err)
		stmt.Exec(newMaitrise, dataCreateUnit.Name.FR)
	}

	if dataCreateUnit.Tier != "" {
		stmt, err := database.Prepare(`UPDATE ListUnit SET ForceUnit = ? WHERE UnitFR = ?;`)
		CheckErr("3- Update updateDataUnit ", err)
		stmt.Exec(dataCreateUnit.Tier, dataCreateUnit.Name.FR)
	}

	if dataCreateUnit.Type.FR != "" {
		// Selection de l'id correspondant
		searchindex, errdb := database.Prepare("SELECT ID FROM ListTypeUnit WHERE TypeFR = ?")
		CheckErr("1- Requete DB UserInfo", errdb)
		index := 0
		searchindex.QueryRow(dataCreateUnit.Type.FR).Scan(&index)

		// Update de l'id
		if index != 0 {
			stmt, err := database.Prepare(`UPDATE ListUnit SET TypeUnit = ? WHERE UnitFR = ?;`)
			CheckErr("3- Update updateDataUnit ", err)
			stmt.Exec(index, dataCreateUnit.Name.FR)
		}
	}

	// changement du nom de l'unit
	if dataCreateUnit.Newunitname.EN != "" {
		stmt, err := database.Prepare(`UPDATE ListUnit SET UnitEN = ? WHERE UnitFR = ?;`)
		CheckErr("6- Update updateDataUnit ", err)
		stmt.Exec(dataCreateUnit.Newunitname.EN, dataCreateUnit.Name.FR)
	}
	if dataCreateUnit.Newunitname.FR != "" {
		stmt, err := database.Prepare(`UPDATE ListUnit SET UnitFR = ? WHERE UnitFR = ?;`)
		CheckErr("6- Update updateDataUnit ", err)
		stmt.Exec(dataCreateUnit.Newunitname.FR, dataCreateUnit.Name.FR)
	}
}

func SendStatGvG(id_House string, database *sql.DB) (listuser []data.UserInfo) {
	listUser, err := database.Prepare(`SELECT DiscordName, GameCharacter_ID, Lvl, Influence, EtatInscription, NbGvGParticiped, NbTotalGvG, DateLastGvGParticiped_FR, DateLastGvGParticiped_EN FROM Users WHERE ID_House = ?;`)
	CheckErr("1- Requete DB fonction SendStatGvG", err)
	rows, err := listUser.Query(id_House)
	CheckErr("2- Requete DB fonction SendStatGvG", err)
	for rows.Next() {
		var user data.UserInfo
		err = rows.Scan(&user.DiscordUsername, &user.GameCharacter_ID, &user.Lvl, &user.Influence, &user.EtatInscription, &user.NbGvGParticiped, &user.NbTotalGvG, &user.DateLastGvGParticiped.FR, &user.DateLastGvGParticiped.EN)
		CheckErr("3- Requete DB fonction SendStatGvG", err)

		if user.GameCharacter_ID != 0 {
			class, errdb := database.Prepare("SELECT ClasseFR, ClasseEN FROM ListGameCharacter WHERE ID = ?")
			CheckErr("Requete DB SendStatGvG", errdb)
			class.QueryRow(user.GameCharacter_ID).Scan(&user.GameCharacter.FR, &user.GameCharacter.EN)
		}
		listuser = append(listuser, user)
	}
	return listuser
}

func Stat_db(database *sql.DB) (stat data.Stat) {
	// Nombre de maison et d'utilisateurs dans la db
	stmt_stathouse, errdb := database.Prepare(`
		SELECT Houses.House_name, Houses.Langage, COUNT(Users.ID) AS total_users
		FROM Houses
		LEFT JOIN Users ON Houses.ID = Users.ID_House
		GROUP BY Houses.ID, Houses.House_name;

	`)
	CheckErr("Requete prepare DB stat_db (stmt_stathouse)", errdb)
	rows, err := stmt_stathouse.Query()
	CheckErr("Requete DB stat_db (stmt_stathouse)", err)
	defer rows.Close()

	for rows.Next() {
		var house data.Houses
		err := rows.Scan(&house.House_name, &house.Langage, &house.ID_Server)
		CheckErr("Erreur lors du scan des résultats stat_db (stmt_stathouse)", err)
		stat.Houses = append(stat.Houses, house)
	}

	// Nombre de tables dans la DB
	stmt_nbtable, errdb := database.Prepare(`
		SELECT COUNT(*) FROM sqlite_master WHERE type = 'table';
	`)
	CheckErr("Requete DB stat_db (stmt_nbtable)", errdb)
	stmt_nbtable.QueryRow().Scan(&stat.Nb_Table)

	return stat
}
