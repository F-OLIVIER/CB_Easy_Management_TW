package data

import (
	"database/sql"
	"fmt"
	"os"
)

func Createdb(adressdb, pathfolderdb string) {
	database, err := sql.Open("sqlite3", adressdb)
	CheckErr(err, "1- Err open db in Createdb")

	// Création des tables de gestion
	ExecuteSQLScript(database, pathfolderdb+"/script_create_table_gestion.sql", "2- Création des tables de gestion")
	// Création des tables d'information du jeu
	ExecuteSQLScript(database, pathfolderdb+"/script_create_table_infogame.sql", "2- Création des tables d'information du jeu")
	// Création des tables du forum
	ExecuteSQLScript(database, pathfolderdb+"/script_create_table_forum.sql", "3- Création des tables du forum")

	// Elément de base : typeUnit
	InsertIfNotExists(database, "SELECT ID FROM ListTypeUnit WHERE TypeFR = 'Cavalerie'", pathfolderdb+"/script_INSERT_ListTypeUnit.sql", "4- Insertion type d’unité")
	// Insertion d'élément de base : classe (weapon)
	InsertIfNotExists(database, "SELECT ID FROM ListGameCharacter WHERE ClasseFR = 'Mousquet'", pathfolderdb+"/script_INSERT_ListGameCharacter.sql", "5- Insertion classe (arme)")
	// Insertion d'élément de base : list des unités
	InsertIfNotExists(database, "SELECT ID FROM ListUnit WHERE UnitFR = 'khorchins'", pathfolderdb+"/script_INSERT_ListUnit.sql", "6- Insertion unité de base")

	database.Close()
}

func ExecuteSQLScript(database *sql.DB, path string, context string) {
	script, err := os.ReadFile(path)
	CheckErr(err, fmt.Sprintf("%s - ouverture du fichier %s", context, path))

	_, err = database.Exec(string(script))
	CheckErr(err, fmt.Sprintf("%s - exécution du script SQL %s", context, path))
}

func InsertIfNotExists(database *sql.DB, checkQuery string, scriptPath string, context string) {
	var id int
	err := database.QueryRow(checkQuery).Scan(&id)
	if err == sql.ErrNoRows {
		script, err := os.ReadFile(scriptPath)
		CheckErr(err, fmt.Sprintf("%s - ouverture du fichier %s", context, scriptPath))

		_, err = database.Exec(string(script))
		CheckErr(err, fmt.Sprintf("%s - exécution du script SQL %s", context, scriptPath))
	} else {
		CheckErr(err, fmt.Sprintf("%s - erreur lors de la vérification d'existence", context))
	}
}

func CheckErr(err error, str string) {
	if err != nil {
		fmt.Printf("\n___________________\nERROR : %v\n%v\n", str, err)
	}
}
