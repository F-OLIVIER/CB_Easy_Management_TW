package utils

import (
	"database/sql"
	data "easemanagementtw/internal"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

func ListAllUnit(database *sql.DB) (ListUnit []data.Unit) {
	listUnit, err := database.Prepare(`
		SELECT ListUnit.ID, 
			ListUnit.UnitFR, 
			ListUnit.UnitEN, 
			ListUnit.InfuenceMax, 
			ListUnit.LvlMax, 
			ListUnit.Maitrise, 
			ListUnit.ForceUnit, 
			ListUnit.Img,
			ListTypeUnit.TypeFR, 
			ListTypeUnit.TypeEN 
		FROM ListUnit
		INNER JOIN ListTypeUnit ON ListUnit.TypeUnit = ListTypeUnit.ID;`)
	CheckErr("1- Requete DB fonction Caserne", err)
	rows, err := listUnit.Query()
	CheckErr("2- Requete DB fonction Caserne", err)
	for rows.Next() {
		defer rows.Close()
		var unit data.Unit
		err = rows.Scan(&unit.ID, &unit.Name.FR, &unit.Name.EN, &unit.Influence, &unit.LvlMax, &unit.Maitrise, &unit.Tier, &unit.Img, &unit.Type.FR, &unit.Type.EN)
		CheckErr("3- Requete DB fonction Caserne", err)
		ListUnit = append(ListUnit, unit)
	}
	return ListUnit
}

func ListUnitType(database *sql.DB) (listUnitType []data.ListLanguage) {
	list, err := database.Prepare("SELECT TypeFR, TypeEN FROM ListTypeUnit")
	CheckErr("1- Requete DB fonction ListUnitType", err)
	rows, err := list.Query()
	CheckErr("2- Requete DB fonction ListUnitType", err)
	for rows.Next() {
		var current_type data.ListLanguage
		err := rows.Scan(&current_type.FR, &current_type.EN)
		CheckErr("Erreur lors du scan des résultats (ListUnitType)", err)
		listUnitType = append(listUnitType, current_type)
	}

	return listUnitType
}

func CaserneUser(userID, id_house string, database *sql.DB) (ListUnit []data.Unit) {
	ListUnit = ListAllUnit(database)

	queryCaserne := fmt.Sprintf("SELECT * FROM Caserne%s WHERE User_ID = ?", id_house)
	userUnit, err := database.Prepare(queryCaserne)
	CheckErr("1- Requete DB fonction CaserneUser", err)
	row, err := userUnit.Query(userID)
	CheckErr("2- Requete DB fonction CaserneUser", err)
	// récupération du nom des colonnes
	columns, err := row.Columns()
	CheckErr("3- Requete DB fonction CaserneUser", err)
	// Créez un tableau pour stocker les valeurs des colonnes
	values := make([]interface{}, len(columns))
	for i := range values {
		values[i] = new(interface{})
	}

	// Ajout des informations concernant l'unité
	for row.Next() {
		err = row.Scan(values...)
		CheckErr("4- Requete DB fonction CaserneUser", err)

		// transformation de l'array d'interface en array de string
		stringValues := make([]string, len(values))
		for i, v := range values {
			switch val := (*v.(*interface{})).(type) {
			case string:
				stringValues[i] = val
			case []byte:
				stringValues[i] = string(val)
			default:
				stringValues[i] = fmt.Sprintf("%v", val)
			}
		}

		for i_columns, col := range columns {
			for i_ListUnit, unit := range ListUnit {
				if col == "Unit"+unit.ID {
					ListUnit[i_ListUnit].Lvl = stringValues[i_columns]
					break
				}
			}
		}
	}

	// Ajout de la maitrise des units
	queryCaserneMaitrise := fmt.Sprintf("SELECT * FROM CaserneMaitrise%s WHERE User_ID = ?", id_house)
	userUnitMaitrise, err := database.Prepare(queryCaserneMaitrise)
	CheckErr("1- Requete DB fonction CaserneUser - maitrise", err)
	rowMaitrise, err := userUnitMaitrise.Query(userID)
	CheckErr("2- Requete DB fonction CaserneUser - maitrise", err)
	defer rowMaitrise.Close()

	columnsMaitrise, err := rowMaitrise.Columns()
	CheckErr("Récupération des colonnes", err)

	scanArgs := make([]interface{}, len(columnsMaitrise))
	valuesMaitrise := make([]interface{}, len(columnsMaitrise))
	for i := range valuesMaitrise {
		scanArgs[i] = &valuesMaitrise[i]
	}

	for rowMaitrise.Next() {
		err := rowMaitrise.Scan(scanArgs...)
		CheckErr("3- Requete DB fonction Caserne - maitrise", err)

		stringValues := make([]string, len(valuesMaitrise))
		for i, v := range valuesMaitrise {
			switch val := v.(type) {
			case string:
				stringValues[i] = val
			case []byte:
				stringValues[i] = string(val)
			case int64:
				stringValues[i] = strconv.FormatInt(val, 10)
			default:
				stringValues[i] = fmt.Sprintf("%v", val)
			}
		}

		for i_columns, col := range columnsMaitrise {
			for i_ListUnit, unit := range ListUnit {
				if col == "Unit"+unit.ID {
					ListUnit[i_ListUnit].UserMaitrise = stringValues[i_columns]
				}
			}
		}
	}

	// Récupération de la liste des doctrines d'influence
	var doctrineRaw string
	stmtdoctrineInflu, err := database.Prepare("SELECT DoctrineInflu FROM Users WHERE ID = ?")
	CheckErr("Erreur db prepare stmtdoctrineInflu (CaserneUser)", err)
	err = stmtdoctrineInflu.QueryRow(userID).Scan(&doctrineRaw)
	CheckErr("Erreur lors du scan des résultats stmtdoctrineInflu (CaserneUser)", err)
	doctrineInflu := strings.Split(doctrineRaw, ",")
	for _, value := range doctrineInflu {
		if value != "" {

			unitID, err := strconv.Atoi(value)
			if err != nil {
				fmt.Println("Erreur de conversion (doctrineRaw) :", value, err)
				continue
			}
			ListUnit[unitID-1].DoctrineInflu = true
		}
	}

	return ListUnit
}

func MAJCaserne(r *http.Request, userID, id_House string, database *sql.DB) (usermaj string) {
	var newCaserne data.ChangeUnitCaserne
	err := json.NewDecoder(r.Body).Decode(&newCaserne)
	CheckErr("Erreur de décodage JSON MAJCaserne", err)

	if userID == "0" {
		userID = newCaserne.Userid
		usermaj = SpecificUserInfo(userID, database)
	}

	var setConditionslevel, setConditionsmaitrise []string // Liste des colonnes à set
	var updateLevel []interface{}                          // Liste des valeurs des colonnes Caserne
	var updateMaitrise []interface{}                       // Liste des valeurs des colonnes CaserneMaitrise
	var doctrineInfluence []string

	for _, unit := range newCaserne.NewLvlUnitCaserne {
		// mise à jour du level
		if unit[1] != "" && strings.Contains(unit[0], "Unit") {
			if unit[1] == "-1" { // Suppression de l'unité
				setConditionslevel = append(setConditionslevel, unit[0]+" = ?") // Liste des colonnes à set
				updateLevel = append(updateLevel, "0")                          // Liste des valeurs des colonnes Caserne
			} else { // Mise à jour du level et de la maitrise de l'unité
				setConditionslevel = append(setConditionslevel, unit[0]+" = ?") // Liste des colonnes à set
				updateLevel = append(updateLevel, unit[1])                      // Liste des valeurs des colonnes Caserne
			}
		}

		// mise à jour de la maitrise
		if unit[2] != "" && strings.Contains(unit[0], "Unit") {
			if unit[1] == "-1" { // Suppression de l'unité
				setConditionsmaitrise = append(setConditionsmaitrise, unit[0]+" = ?") // Liste des colonnes à set
				updateMaitrise = append(updateMaitrise, "0")                          // Liste des valeur des colonnes CaserneMaitrise
			} else { // Mise à jour du level et de la maitrise de l'unité
				setConditionsmaitrise = append(setConditionsmaitrise, unit[0]+" = ?") // Liste des colonnes à set
				updateMaitrise = append(updateMaitrise, unit[2])                      // Liste des valeur des colonnes CaserneMaitrise
			}
		}

		// Mise a jour doctrine d'influence
		if unit[3] == "0" {
			doctrineInfluence = append(doctrineInfluence, strings.TrimPrefix(unit[0], "Unit"))
		}
	}

	// mise à jour du level
	if len(setConditionslevel) > 0 {
		Checkbeforeupdatecaserne(userID, id_House, database)
		// Mise à jours de la Caserne
		query := "UPDATE Caserne" + id_House + " SET " + strings.Join(setConditionslevel, ", ") + " WHERE User_ID = ?"
		stmt, err := database.Prepare(query)
		CheckErr("Requete db MAJCaserne Caserne :", err)
		updateLevel = append(updateLevel, userID)
		stmt.Exec(updateLevel...)
	}

	// mise à jour de la maitrise
	if len(setConditionsmaitrise) > 0 {
		CheckbeforeupdateMaitrise(userID, id_House, database)
		// Mise à jours de la CaserneMaitrise
		queryMaitrise := "UPDATE CaserneMaitrise" + id_House + " SET " + strings.Join(setConditionsmaitrise, ", ") + " WHERE User_ID = ?"
		stmtMaitrise, err := database.Prepare(queryMaitrise)
		CheckErr("Requete db MAJCaserne CaserneMaitrise :", err)
		updateMaitrise = append(updateMaitrise, userID)
		stmtMaitrise.Exec(updateMaitrise...)
	}

	// Mise à jours de la liste des doctrines d'influence
	stmtDoctrineInflu, err := database.Prepare("UPDATE Users SET DoctrineInflu = ? WHERE ID = ?")
	CheckErr("Requete db DoctrineInflu MAJCaserne :", err)
	_, err = stmtDoctrineInflu.Exec(strings.Join(doctrineInfluence, ","), userID)
	CheckErr("Execution update doctrineInflu (MAJCaserne) :", err)

	return usermaj
}

func Checkbeforeupdatecaserne(userID, id_House string, database *sql.DB) {
	querytest := "SELECT ID FROM Caserne" + id_House + " WHERE User_ID = ?"
	stmt, err := database.Prepare(querytest)
	CheckErr("DB prépare checkbeforeupdatecaserne", err)
	id := 0
	stmt.QueryRow(userID).Scan(&id)
	CheckErr("Requete DB checkbeforeupdatecaserne", err)
	if id == 0 {
		queryinsert := "INSERT INTO Caserne" + id_House + " (User_ID) VALUES(?);"
		insert, err := database.Prepare(queryinsert)
		CheckErr("1- INSERT checkbeforeupdatecaserne ", err)
		insert.Exec(userID)
	}
}

func CheckbeforeupdateMaitrise(userID, id_House string, database *sql.DB) {
	querytest := "SELECT ID FROM CaserneMaitrise" + id_House + " WHERE User_ID = ?"
	stmt, err := database.Prepare(querytest)
	CheckErr("DB prépare checkbeforeupdateMaitrise", err)
	id := 0
	stmt.QueryRow(userID).Scan(&id)
	CheckErr("Requete DB checkbeforeupdateMaitrise", err)
	if id == 0 {
		queryinsert := "INSERT INTO CaserneMaitrise" + id_House + " (User_ID) VALUES(?);"
		insert, err := database.Prepare(queryinsert)
		CheckErr("1- INSERT checkbeforeupdateMaitrise ", err)
		insert.Exec(userID)
	}
}
