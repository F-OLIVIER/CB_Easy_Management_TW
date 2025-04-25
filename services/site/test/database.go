package test

import (
	"database/sql"
	"fmt"
	"os"
)

// insertTestData insère les données de test dans la base de données
func InsertTestData(DB_test *sql.DB) {
	// Création d'une maison
	insertDB(DB_test, `
		INSERT INTO Houses (House_name, House_logo, Langage, ID_Server, ID_Group_Users, ID_Group_Officier, ID_Chan_GvG, ID_Chan_Gestion, ID_Chan_Users, ID_MessageGvG)
		VALUES ('house test', 'logo test', 'fr', 'no ID_Server', 'no ID_Group_Users', 'no ID_Group_Officier', 'no ID_Chan_GvG', 'no ID_Chan_Gestion', 'no ID_Chan_Users', '0123466789');
	`)
	// Création des tables spécifique de la maison
	if err := createHouse1Tables(DB_test); err != nil {
		fmt.Println("Erreur lors de la création des tables spécifique de la maison : ", err)
		os.Exit(1)
	}
	// Insertion d'utilisateurs de base pour les tests
	insertDB(DB_test, `
		INSERT INTO Users (ID_House, DiscordID, DiscordName, DiscordBaseName, DiscordRole, DiscordPhoto, EtatInscription, userLangage, uuidApp, uuidAppUse)
		VALUES (1, 0, 'user test 1', 'user test 1', 'Member', '', -1, 'en', 'code_user_test', 2);
	`)
	insertDB(DB_test, `
		INSERT INTO Users (ID_House, DiscordID, DiscordName, DiscordBaseName, DiscordRole, DiscordPhoto, EtatInscription, userLangage, uuidApp, uuidAppUse)
		VALUES (1, 0, 'user test 2', 'user test 2', 'Member', '', -1, 'en', 'code_user_test', 2);
	`)
}

func insertDB(db *sql.DB, query string) {
	// Démarre une transaction
	tx, err := db.Begin()
	if err != nil {
		fmt.Printf("Erreur lors du début de la transaction : %v", err)
		os.Exit(1)
	}

	// Exécute la requête d'insertion dans la transaction
	if _, err := tx.Exec(query); err != nil {
		// Si une erreur survient, on effectue un rollback et on échoue le test
		tx.Rollback()
		fmt.Printf("Erreur lors de l'insertion dans la DB : %v", err)
		os.Exit(1)
	}

	// Si tout va bien, on effectue un commit de la transaction
	if err := tx.Commit(); err != nil {
		fmt.Printf("Erreur lors du commit de la transaction : %v", err)
		os.Exit(1)
	}
}

func createHouse1Tables(db *sql.DB) error {
	// requêtes de création des tables
	tableQueries := []string{
		`CREATE TABLE IF NOT EXISTS GroupGvG1 (
			ID INTEGER PRIMARY KEY,
			User_ID INTEGER NOT NULL,
			GroupNumber INTEGER NOT NULL,
			Unit1 VARCHAR(50) DEFAULT "",
			Unit2 VARCHAR(50) DEFAULT "",
			Unit3 VARCHAR(50) DEFAULT "",
			Unit4 VARCHAR(50) DEFAULT "",
			Comment VARCHAR(500) DEFAULT "",
			FOREIGN KEY (User_ID) REFERENCES Users (ID)
		);`,
		`CREATE TABLE IF NOT EXISTS GroupTypeAtt1 (
			ID INTEGER PRIMARY KEY,
			User_ID INTEGER NOT NULL,
			GroupNumber INTEGER NOT NULL,
			Unit1 VARCHAR(50) DEFAULT "",
			Unit2 VARCHAR(50) DEFAULT "",
			Unit3 VARCHAR(50) DEFAULT "",
			Unit4 VARCHAR(50) DEFAULT "",
			Comment VARCHAR(500) DEFAULT "",
			FOREIGN KEY (User_ID) REFERENCES Users (ID)
		);`,
		`CREATE TABLE IF NOT EXISTS GroupTypeDef1 (
			ID INTEGER PRIMARY KEY,
			User_ID INTEGER NOT NULL,
			GroupNumber INTEGER NOT NULL,
			Unit1 VARCHAR(50) DEFAULT "",
			Unit2 VARCHAR(50) DEFAULT "",
			Unit3 VARCHAR(50) DEFAULT "",
			Unit4 VARCHAR(50) DEFAULT "",
			Comment VARCHAR(500) DEFAULT "",
			FOREIGN KEY (User_ID) REFERENCES Users (ID)
		);`,
		`CREATE TABLE IF NOT EXISTS NameGroupGvG1 (
			ID INTEGER PRIMARY KEY,
			GroupNumber INTEGER NOT NULL,
			NameGroup VARCHAR(150) NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS Caserne1 (
			ID INTEGER PRIMARY KEY,
			User_ID INTEGER NOT NULL,
		    Unit1 INTEGER DEFAULT 0,
			Unit2 INTEGER DEFAULT 0,
		    Unit3 INTEGER DEFAULT 0,
		    Unit4 INTEGER DEFAULT 0,
			Unit5 INTEGER DEFAULT 0,
		    Unit6 INTEGER DEFAULT 0,
		    Unit7 INTEGER DEFAULT 0,
		    Unit8 INTEGER DEFAULT 0,
		    Unit9 INTEGER DEFAULT 0,
		    Unit10 INTEGER DEFAULT 0,
			FOREIGN KEY (User_ID) REFERENCES Users(ID)
		);`,
		`CREATE TABLE IF NOT EXISTS CaserneMaitrise1 (
			ID INTEGER PRIMARY KEY,
			User_ID INTEGER NOT NULL,
		    Unit1 INTEGER DEFAULT 0,
			Unit2 INTEGER DEFAULT 0,
		    Unit3 INTEGER DEFAULT 0,
		    Unit4 INTEGER DEFAULT 0,
			Unit5 INTEGER DEFAULT 0,
		    Unit6 INTEGER DEFAULT 0,
		    Unit7 INTEGER DEFAULT 0,
		    Unit8 INTEGER DEFAULT 0,
		    Unit9 INTEGER DEFAULT 0,
		    Unit10 INTEGER DEFAULT 0,
			FOREIGN KEY (User_ID) REFERENCES Users(ID)
		);`,
	}

	for _, query := range tableQueries {
		_, err := db.Exec(query)
		if err != nil {
			return fmt.Errorf("Erreur lors de la création de la table : %v", err)
		}
	}

	return nil
}
