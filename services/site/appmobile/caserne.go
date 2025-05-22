package appmobile

import (
	"database/sql"
	data "easemanagementtw/internal"
	utils "easemanagementtw/middleware"
	"slices"
	"strings"
)

func UpdateAppCaserne(newCaserne data.ChangeUnitCaserne, database *sql.DB) {
	if newCaserne.Userid != "" {
		// Récupération de l'id utilisateur
		userID, id_House, _, exit, _ := UserInfoApp(newCaserne.Userid, database)

		if exit {
			var setConditionslevel, setConditionsmaitrise []string // Liste des colonnes à set
			var updateLevel []interface{}                          // Liste des valeurs des colonnes Caserne
			var updateMaitrise []interface{}                       // Liste des valeurs des colonnes CaserneMaitrise

			// Récupération des doctrines d'influence
			var doctrineRaw string
			stmtdoctrineInflu, err := database.Prepare("SELECT DoctrineInflu FROM Users WHERE ID = ?")
			utils.CheckErr("Erreur db prepare stmtdoctrineInflu (UpdateAppCaserne)", err)
			err = stmtdoctrineInflu.QueryRow(userID).Scan(&doctrineRaw)
			utils.CheckErr("Erreur lors du scan des résultats stmtdoctrineInflu (UpdateAppCaserne)", err)
			doctrineInflu := strings.Split(doctrineRaw, ",")

			for _, unit := range newCaserne.NewAppUnitCaserne {
				// Mise à jour du level
				if unit.Lvl != "" {
					setConditionslevel = append(setConditionslevel, "Unit"+unit.ID+" = ?") // Liste des colonnes à set
					updateLevel = append(updateLevel, unit.Lvl)                            // Liste des valeurs des colonnes Caserne
				}

				// Mise à jour de la maitrise
				if unit.UserMaitrise != "" {
					setConditionsmaitrise = append(setConditionsmaitrise, "Unit"+unit.ID+" = ?") // Liste des colonnes à set
					updateMaitrise = append(updateMaitrise, unit.UserMaitrise)                   // Liste des valeur des colonnes CaserneMaitrise
				}

				// Récupération des mise à jour doctrine d'influence
				if unit.DoctrineInflu {
					if !slices.Contains(doctrineInflu, unit.ID) {
						doctrineInflu = append(doctrineInflu, unit.ID)
					}
				} else {
					if slices.Contains(doctrineInflu, unit.ID) {
						doctrineInflu = removeFromSlice(doctrineInflu, unit.ID)
					}
				}
			}

			// Mise à jours de la liste des doctrines d'influence
			stmtDoctrineInflu, err := database.Prepare("UPDATE Users SET DoctrineInflu = ? WHERE ID = ?")
			utils.CheckErr("Requete db DoctrineInflu UpdateAppCaserne :", err)
			_, err = stmtDoctrineInflu.Exec(strings.Join(doctrineInflu, ","), userID)
			utils.CheckErr("Execution update doctrineInflu (UpdateAppCaserne) :", err)

			// mise à jour du level
			if len(setConditionslevel) > 0 {
				utils.Checkbeforeupdatecaserne(userID, id_House, database)
				// Mise à jours de la Caserne
				query := "UPDATE Caserne" + id_House + " SET " + strings.Join(setConditionslevel, ", ") + " WHERE User_ID = ?"
				stmt, err := database.Prepare(query)
				utils.CheckErr("Requete db MAJCaserne Caserne :", err)
				updateLevel = append(updateLevel, userID)
				stmt.Exec(updateLevel...)
			}

			// mise à jour de la maitrise
			if len(setConditionsmaitrise) > 0 {
				utils.CheckbeforeupdateMaitrise(userID, id_House, database)
				// Mise à jours de la CaserneMaitrise
				queryMaitrise := "UPDATE CaserneMaitrise" + id_House + " SET " + strings.Join(setConditionsmaitrise, ", ") + " WHERE User_ID = ?"
				stmtMaitrise, err := database.Prepare(queryMaitrise)
				utils.CheckErr("Requete db MAJCaserne CaserneMaitrise :", err)
				updateMaitrise = append(updateMaitrise, userID)
				stmtMaitrise.Exec(updateMaitrise...)
			}

			// mise à jour doctrine d'influence

		}
	}
}

func removeFromSlice(slice []string, item string) []string {
	newSlice := []string{}
	for _, v := range slice {
		if v != item {
			newSlice = append(newSlice, v)
		}
	}
	return newSlice
}
