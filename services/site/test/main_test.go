package test

import (
	"database/sql"
	data "easemanagementtw/internal"
	"fmt"
	"os"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

var DB_test *sql.DB
var adressdb = "../../database/databaseTest.db"

// TestMain est une fonction spéciale dans les tests Go qui permet de gérer la configuration avant et après les tests
func TestMain(m *testing.M) {
	// Configuration avant les tests
	SetUpTestDB()
	// Exécution des tests
	exitCode := m.Run()
	// Nettoyage après les tests
	TearDownTestDB()
	os.Exit(exitCode)
}

func SetUpTestDB() {
	data.Createdb(adressdb, "../../database")
	var err error
	DB_test, err = sql.Open("sqlite3", adressdb)
	if err != nil {
		fmt.Printf("Erreur d'ouverture de la base de données : %v\n", err)
		os.Exit(1)
	}

	InsertTestData(DB_test)
}

func TearDownTestDB() {
	if DB_test != nil {
		DB_test.Close()
	}
	os.Remove(adressdb)
}
