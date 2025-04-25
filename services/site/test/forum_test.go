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

func TestForum(t *testing.T) {
	// Création d'une requête HTTP simulée pour insérer un post
	postData := map[string]string{
		"Title":   "Titre test post",
		"Content": "Contenu test post",
	}
	postBody, err := json.Marshal(postData)
	if err != nil {
		t.Fatalf("Erreur lors de la création du corps de la requête : %v", err)
	}
	reqPost := httptest.NewRequest("POST", "/new-post", bytes.NewBuffer(postBody))
	reqPost.Header.Set("Content-Type", "application/json")

	// TEST FONCTION : Appeler la fonction NewPost avec la requête simulée
	notifpost := utils.NewPost(reqPost, "1", DB_test)
	assert.Equal(t, "success", notifpost.Type)

	// Création d'une requête HTTP simulée pour insérer une réponse à un post
	commentData := map[string]string{
		"ID":      "1",
		"Content": "Contenu test reponse post",
	}
	commentBody, err := json.Marshal(commentData)
	if err != nil {
		t.Fatalf("Erreur lors de la création du corps de la requête : %v", err)
	}
	reqComment := httptest.NewRequest("POST", "/new-comment", bytes.NewBuffer(commentBody))
	reqComment.Header.Set("Content-Type", "application/json")

	// TEST FONCTION : Appeler la fonction NewComment avec la requête simulée
	notifComment := utils.NewComment(reqComment, "2", DB_test)
	assert.Equal(t, "success", notifComment.Type)

	//  TEST FONCTION : Appelle la fonction de récupération des posts et commentaires
	posts := utils.Forum(DB_test)

	// Test des résultats de la fonction "Forum"
	if len(posts) != 1 {
		t.Fatalf("Nombre de posts attendu : 1, obtenu : %d", len(posts))
	}
	if posts[0].Author != "user test 1" {
		t.Errorf("Auteur attendu : 'user test 1', obtenu : '%s'", posts[0].Author)
	}
	if posts[0].Title != "Titre test post" {
		t.Errorf("Titre attendu : 'Titre test post', obtenu : '%s'", posts[0].Title)
	}
	// Test des résultats de la sous-fonction "SearchPostComment"
	if len(posts[0].Comments) != 1 {
		t.Fatalf("Nombre de réponse au posts attendu : 1, obtenu : %d", len(posts[0].Comments))
	}
	if posts[0].Comments[0].Author != "user test 2" {
		t.Errorf("Auteur attendu : 'user test 2', obtenu : '%s'", posts[0].Comments[0].Author)
	}
	if posts[0].Comments[0].Content != "Contenu test reponse post" {
		t.Errorf("Contenu attendu : 'Contenu test reponse post', obtenu : '%s'", posts[0].Comments[0].Content)
	}
}
