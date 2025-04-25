package appmobile

import (
	"database/sql"
	data "easemanagementtw/internal"
	utils "easemanagementtw/middleware"
)

func UserInfoApp(uuidApp string, database *sql.DB) (user_id, id_House, langage string, exist, officier bool) {
	if uuidApp != "" {
		stmt, errdb := database.Prepare("SELECT ID, ID_House, DiscordRole, userLangage FROM Users WHERE uuidApp = ?")
		defer stmt.Close()
		utils.CheckErr("Requete DB UserInfoApp", errdb)
		var DiscordRole string
		// Vérifier si la requête renvoie une ligne
		err := stmt.QueryRow(uuidApp).Scan(&user_id, &id_House, &DiscordRole, &langage)
		// Si erreurs de requête (ex: aucune ligne n'est trouvée)
		if err != nil {
			if err == sql.ErrNoRows {
				// Aucun utilisateur trouvé
				return "", "", "", false, false
			}
			utils.CheckErr("Erreur lors du Scan de la requête UserInfoApp", err)
			return "", "", "", false, false
		}

		// Si un résultat est trouvé
		if DiscordRole == "Officier" {
			return user_id, id_House, langage, true, true
		}
		return user_id, id_House, langage, true, false
	}
	return "", "", "", false, false
}

func GetHouseApp(id_House string, database *sql.DB) (houses []data.Houses) {
	var house data.Houses
	stmt, errdb := database.Prepare("SELECT ID, House_name, House_logo FROM Houses WHERE ID = ?")
	utils.CheckErr("Requete SELECT DB GetHouseApp", errdb)
	stmt.QueryRow(id_House).Scan(&house.ID, &house.House_name, &house.House_logo)
	houses = append(houses, house)
	return houses
}

func CharactercardApp(uuidApp string, login bool, database *sql.DB) (userInfo data.UserInfo) {
	userInfo.CodeApp = uuidApp

	stmt1, errdb := database.Prepare("SELECT ID, GameCharacter_ID, Lvl, Influence, EtatInscription, NbGvGParticiped, NbTotalGvG, DateLastGvGParticiped_FR, DateLastGvGParticiped_EN, uuidAppUse FROM Users WHERE uuidApp = ?")
	if errdb != nil {
		utils.CheckErr("1- Requete SELECT DB CharactercardApp", errdb)
		return userInfo
	}

	var uuidAppUse int
	err := stmt1.QueryRow(uuidApp).Scan(&userInfo.ID, &userInfo.GameCharacter_ID, &userInfo.Lvl, &userInfo.Influence, &userInfo.EtatInscription, &userInfo.NbGvGParticiped, &userInfo.NbTotalGvG, &userInfo.DateLastGvGParticiped.FR, &userInfo.DateLastGvGParticiped.EN, &uuidAppUse)
	if err != nil {
		utils.CheckErr("Erreur lors de la récupération des données de l'utilisateur CharactercardApp", err)
		return userInfo
	}

	if login {
		if uuidAppUse == 0 {
			stmt2, erruuidAppUse := database.Prepare("UPDATE Users SET uuidAppUse = 1 WHERE uuidApp = ?")
			utils.CheckErr("2- Requete UPDATE DB CharactercardApp", erruuidAppUse)
			stmt2.Exec(uuidApp)
		} else if uuidAppUse == 786 {
			// Utilisateur de test, ne rien faire
		} else {
			var noUserInfo data.UserInfo
			noUserInfo.CodeApp = uuidApp
			userInfo = noUserInfo
			return userInfo
		}
	}

	if userInfo.GameCharacter_ID != 0 {
		stmt2, errdb := database.Prepare("SELECT ClasseFR, ClasseEN FROM ListGameCharacter WHERE ID = ?")
		utils.CheckErr("3- Requete SELECT DB CharactercardApp", errdb)
		stmt2.QueryRow(userInfo.GameCharacter_ID).Scan(&userInfo.GameCharacter.FR, &userInfo.GameCharacter.EN)
	} else {
		userInfo.GameCharacter.FR = "Non sélectionné"
		userInfo.GameCharacter.EN = "Not selected"
	}

	userInfo.ID = 0

	return userInfo
}

func UpdateInscription(newUserInfo data.UserInfo, database *sql.DB) bool {
	if newUserInfo.EtatInscription == 1 || newUserInfo.EtatInscription == 3 { // 1: s'incrit present, 3: s'inscrit absent
		if utils.RegistrationAuthorised() {
			stmt3, errdb := database.Prepare("UPDATE Users SET EtatInscription = ? WHERE uuidApp = ?")
			if errdb != nil {
				utils.CheckErr("9- Requete DB UpdateCharacterApp", errdb)
				return false
			}
			stmt3.Exec(newUserInfo.EtatInscription, newUserInfo.CodeApp)
			return true
		} else {
			return false
		}
	}
	return false
}

func UpdateCharacterApp(newUserInfo data.UserInfo, database *sql.DB) bool {
	// Récupération id de la classe jouer

	if newUserInfo.GameCharacter.FR != "" {
		stmt1, errdb := database.Prepare("SELECT ID FROM ListGameCharacter WHERE ClasseFR = ?")
		utils.CheckErr("1- Requete DB UpdateCharacterApp", errdb)
		stmt1.QueryRow(newUserInfo.GameCharacter.FR).Scan(&newUserInfo.GameCharacter_ID)
	} else if newUserInfo.GameCharacter.EN != "" {
		stmt1, errdb := database.Prepare("SELECT ID FROM ListGameCharacter WHERE ClasseEN = ?")
		utils.CheckErr("1- Requete DB UpdateCharacterApp", errdb)
		stmt1.QueryRow(newUserInfo.GameCharacter.EN).Scan(&newUserInfo.GameCharacter_ID)
	} else {
		newUserInfo.GameCharacter_ID = 0
	}

	if newUserInfo.Influence != "" && newUserInfo.Lvl != "" && newUserInfo.GameCharacter_ID != 0 {
		// les 3 sont saisies (Class + Lvl + Influence)
		stmt2, errdb := database.Prepare("UPDATE Users SET GameCharacter_ID = ?, Lvl = ?, Influence = ? WHERE uuidApp = ?")
		utils.CheckErr("2- Requete DB UpdateCharacterApp", errdb)
		stmt2.Exec(newUserInfo.GameCharacter_ID, newUserInfo.Lvl, newUserInfo.Influence, newUserInfo.CodeApp)
	} else if newUserInfo.Influence != "" && newUserInfo.Lvl != "" {
		// Lvl + Influence
		stmt2, errdb := database.Prepare("UPDATE Users SET Lvl = ?, Influence = ? WHERE uuidApp = ?")
		utils.CheckErr("3- Requete DB UpdateCharacterApp", errdb)
		stmt2.Exec(newUserInfo.Lvl, newUserInfo.Influence, newUserInfo.CodeApp)
	} else if newUserInfo.Influence != "" && newUserInfo.GameCharacter_ID != 0 {
		// Class + Influence
		stmt2, errdb := database.Prepare("UPDATE Users SET GameCharacter_ID = ?, Influence = ? WHERE uuidApp = ?")
		utils.CheckErr("4- Requete DB UpdateCharacterApp", errdb)
		stmt2.Exec(newUserInfo.GameCharacter_ID, newUserInfo.Influence, newUserInfo.CodeApp)
	} else if newUserInfo.Lvl != "" && newUserInfo.GameCharacter_ID != 0 {
		// Class + Lvl
		stmt2, errdb := database.Prepare("UPDATE Users SET GameCharacter_ID = ?, Lvl = ? WHERE uuidApp = ?")
		utils.CheckErr("5- Requete DB UpdateCharacterApp", errdb)
		stmt2.Exec(newUserInfo.GameCharacter_ID, newUserInfo.Lvl, newUserInfo.CodeApp)
	} else if newUserInfo.GameCharacter_ID != 0 {
		// Class
		stmt2, errdb := database.Prepare("UPDATE Users SET GameCharacter_ID = ? WHERE uuidApp = ?")
		utils.CheckErr("6- Requete DB UpdateCharacterApp", errdb)
		stmt2.Exec(newUserInfo.GameCharacter_ID, newUserInfo.CodeApp)
	} else if newUserInfo.Lvl != "" {
		// Lvl
		stmt2, errdb := database.Prepare("UPDATE Users SET Lvl = ? WHERE uuidApp = ?")
		utils.CheckErr("7- Requete DB UpdateCharacterApp", errdb)
		stmt2.Exec(newUserInfo.Lvl, newUserInfo.CodeApp)
	} else if newUserInfo.Influence != "" {
		// Influence
		stmt2, errdb := database.Prepare("UPDATE Users SET Influence = ? WHERE uuidApp = ?")
		utils.CheckErr("8- Requete DB UpdateCharacterApp", errdb)
		stmt2.Exec(newUserInfo.Influence, newUserInfo.CodeApp)
	}

	return false
}

func UpdateSetting(userInfo data.UserInfo, database *sql.DB) {
	stmt2, errdb := database.Prepare("UPDATE Users SET userLangage = ? WHERE uuidApp = ?")
	utils.CheckErr("5- Requete DB UpdateCharacterApp", errdb)
	stmt2.Exec(userInfo.Language, userInfo.CodeApp)
}
