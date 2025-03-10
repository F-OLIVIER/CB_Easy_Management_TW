package data

import (
	"database/sql"
	"fmt"
	"os"
)

func Createdb() {
	database, err := sql.Open("sqlite3", "../database/databaseGvG.db")
	CheckErr(err, "1- Err open db in Createdb")

	// create table
	scriptSQL_table, err := os.ReadFile("../database/script_create_table_common.sql")
	CheckErr(err, "2- open file script_create_table_common.sql (Createdb.go)")
	_, err = database.Exec(string(scriptSQL_table))
	CheckErr(err, "2- Err execute script_create_table in db (Createdb.go)")

	// Elément de base : typeUnit
	idTypeUnit := database.QueryRow("SELECT ID FROM ListTypeUnit WHERE TypeFR = 'Cavalerie'").Scan()
	if idTypeUnit == sql.ErrNoRows {
		scriptSQL_type, err := os.ReadFile("../database/script_INSERT_ListTypeUnit.sql")
		CheckErr(err, "3- open file script_INSERT_ListTypeUnit.sql (Createdb.go)")
		_, err = database.Exec(string(scriptSQL_type))
		CheckErr(err, "3- Err script Insert ListTypeUnit in db (Createdb.go)")
	}

	// Elément de base : classe (weapon)
	idClass := database.QueryRow("SELECT ID FROM ListGameCharacter WHERE ClasseFR = 'Mousquet'").Scan()
	if idClass == sql.ErrNoRows {
		scriptSQL_class, err := os.ReadFile("../database/script_INSERT_ListGameCharacter.sql")
		CheckErr(err, "4- open file script_INSERT_ListGameCharacter.sql (Createdb.go)")
		_, err = database.Exec(string(scriptSQL_class))
		CheckErr(err, "4- Err script Insert ListGameCharacter in db (Createdb.go)")
	}

	// Elément de base : list des unités
	idbaseUnit := database.QueryRow("SELECT ID FROM ListUnit WHERE UnitFR = 'khorchins'").Scan()
	if idbaseUnit == sql.ErrNoRows {
		scriptSQL_unit, err := os.ReadFile("../database/script_INSERT_ListUnit.sql")
		CheckErr(err, "5- open file script_INSERT_ListUnit.sql (Createdb.go)")
		_, err = database.Exec(string(scriptSQL_unit))
		CheckErr(err, "5- Err script Insert ListUnit in db (Createdb.go)")
	}

	fmt.Println("Création intial de la DB terminé")

	database.Close()
}

func CheckErr(err error, str string) {
	if err != nil {
		fmt.Printf("\n___________________\nERROR : %v\n%v\n", str, err)
	}
}
