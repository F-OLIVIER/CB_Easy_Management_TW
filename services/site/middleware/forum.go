package utils

import (
	data "botgvg/internal"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

func Forum(database *sql.DB) (listpost []data.Post) {
	rows, err := database.Query(`
		SELECT 
			Forum.ID, 
			Forum.Date, 
			Forum.Title, 
			Forum.Content, 
			Forum.Valid, 
			Forum.Archive, 
			COALESCE(Users.DiscordName, 'user delete') AS DiscordName
		FROM Forum
		LEFT JOIN Users ON Users.ID = Forum.Author;
	`)
	CheckErr("1- Forum", err)

	for rows.Next() {
		var post data.Post
		err := rows.Scan(&post.ID, &post.Date, &post.Title, &post.Content, &post.Valid, &post.Archive, &post.Author)
		CheckErr("2- scan Forum", err)
		post.Comments = SearchPostComment(post.ID, database)
		listpost = append(listpost, post)
	}

	return listpost
}

func SearchPostComment(post_ID string, database *sql.DB) (listComment []*data.Post) {
	rows, err := database.Query(`
		SELECT Comments.ID, Comments.Date, Comments.Content, COALESCE(Users.DiscordName, 'user delete') AS DiscordName
		FROM Comments 
		LEFT JOIN Users ON Users.ID = Comments.Author
		WHERE Comments.Post_ID = ?;`, post_ID)

	if err == sql.ErrNoRows {
		return nil
	} else if err != nil {
		CheckErr("1- LEFT JOIN SearchPostComment", err)
		return nil
	}

	for rows.Next() {
		comment := &data.Post{}
		err := rows.Scan(&comment.ID, &comment.Date, &comment.Content, &comment.Author)
		CheckErr("2- scan comment SearchPostComment", err)
		listComment = append(listComment, comment)
	}

	return listComment
}

func NewPost(r *http.Request, author string, database *sql.DB) (notif data.Notif) {
	var newpost data.Post
	err := json.NewDecoder(r.Body).Decode(&newpost)
	CheckErr("Erreur de décodage JSON NewPost", err)

	exist := 0
	stmt1, errdb := database.Prepare("SELECT ID FROM Forum WHERE Title = ?")
	if errdb != sql.ErrNoRows {
		CheckErr("1- Requete DB NewPost", errdb)
	}

	stmt1.QueryRow(newpost.Title).Scan(&exist)
	if exist != 0 {
		notif.Type = "error"
		notif.Content = data.ListLanguage{
			FR: "Ce nom de post existe déjà.",
			EN: "This post name already exists.",
		}
	} else if newpost.Title != "" && !strings.Contains(strings.ToLower(newpost.Title), "<script>") && newpost.Content != "" && !strings.Contains(strings.ToLower(newpost.Content), "<script>") {
		stmt, err := database.Prepare("INSERT INTO Forum(Author, Date, Title, Content) Values(?,?,?,?)")
		CheckErr("2- INSERT NewPost", err)
		stmt.Exec(author, time.Now(), newpost.Title, newpost.Content)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre post a été créé avec succès.",
			EN: "Your post has been successfully created.",
		}
	} else {
		notif.Type = "error"
		notif.Content = data.ListLanguage{
			FR: "Erreur lors de la création du post.",
			EN: "Error when creating the post.",
		}
	}

	notif.Notif = true
	return notif
}

func NewComment(r *http.Request, author string, database *sql.DB) (notif data.Notif) {
	var newcomment data.Post
	err := json.NewDecoder(r.Body).Decode(&newcomment)
	CheckErr("Erreur de décodage JSON NewPost", err)

	if newcomment.Content != "" && !strings.Contains(strings.ToLower(newcomment.Content), "<script>") {
		stmt, err := database.Prepare("INSERT INTO Comments(Post_ID, Author, Date, Content) Values(?,?,?,?)")
		CheckErr("2- INSERT NewComment", err)
		stmt.Exec(newcomment.ID, author, time.Now(), newcomment.Content)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre commentaire a été créé avec succès.",
			EN: "Your comment has been successfully created.",
		}
	} else {
		notif.Type = "error"
		notif.Content = data.ListLanguage{
			FR: "Erreur lors de la création du commentaire.",
			EN: "Error when creating the comment.",
		}
	}

	notif.Notif = true
	return notif
}
