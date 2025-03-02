package appmobile

import (
	data "botgvg/internal"
	utils "botgvg/middleware"
	"database/sql"
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
			}

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
		}
	}
}
