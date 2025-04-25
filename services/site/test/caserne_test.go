package test

import (
	"bytes"
	utils "easemanagementtw/middleware"
	"encoding/json"
	"net/http/httptest"
	"testing"

	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
)

func TestCaserne(t *testing.T) {
	// Création d'une requête HTTP simulée pour insérer un utilisateur dans la caserne
	unitData := map[string]interface{}{
		"listNewLvlUnitCaserne": [][]string{
			{"Unit1", "12", "2"}, // Mise à jour de l'unité 1 (lvl 12, maitrise compléte)
			{"Unit5", "8", "1"},  // Mise à jour de l'unité 5 (lvl 8, maitrise en cour)
		},
		"iduser": "1",
	}

	// Convertir les données en JSON pour la requête simulée
	unitBody, err := json.Marshal(unitData)
	if err != nil {
		t.Fatalf("Erreur lors de la création du corps de la requête : %v", err)
	}
	reqMajCaserne := httptest.NewRequest("POST", "/maj-caserne", bytes.NewBuffer(unitBody))
	reqMajCaserne.Header.Set("Content-Type", "application/json")

	// TEST FONCTION : MAJCaserne
	usermaj := utils.MAJCaserne(reqMajCaserne, "0", "1", DB_test)

	// Vérifier que la réponse de MAJCaserne est correcte
	assert.Equal(t, "user test 1", usermaj, "La mise à jour de la caserne a échoué")

	// TEST FONCTION : Appelle la fonction de récupération les unité de la caserne de l'utilisateurs 1
	ListUnit := utils.CaserneUser("1", "1", DB_test)

	// Vérifier les valeurs de chaque unité
	assert.Equal(t, "12", ListUnit[0].Lvl, "L'unité 1 doit avoir un niveau de 12")
	assert.Equal(t, "2", ListUnit[0].UserMaitrise, "L'unité 1 doit avoir une maîtrise complète")
	assert.Equal(t, "8", ListUnit[4].Lvl, "L'unité 5 doit avoir un niveau de 8")
	assert.Equal(t, "1", ListUnit[4].UserMaitrise, "L'unité 5 doit avoir une maîtrise en cours")

}
