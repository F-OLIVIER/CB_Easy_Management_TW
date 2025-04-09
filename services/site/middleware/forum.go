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

	if newpost.Title != "" && !strings.Contains(strings.ToLower(newpost.Title), "<script>") && newpost.Content != "" && !strings.Contains(strings.ToLower(newpost.Content), "<script>") {
		stmt, err := database.Prepare("INSERT INTO Forum(Author, Date, Title, Content) Values(?,?,?,?)")
		CheckErr("2- INSERT NewPost", err)
		stmt.Exec(author, time.Now(), newpost.Title, newpost.Content)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre post a été créé avec succès. Il sera visible dès qu'un administrateur le validera.",
			EN: "Your post has been successfully created. It will be visible as soon as an administrator validates it.",
		}

		// Récupération des information de l'utilisateur
		var discordID, discordName, userLangage string
		stmtuser, errdb := database.Prepare(`SELECT DiscordID, DiscordName, userLangage FROM Users WHERE ID = ?`)
		if errdb != sql.ErrNoRows {
			CheckErr("1- Requete DB Modifpost", errdb)
		}
		stmtuser.QueryRow(author).Scan(&discordID, &discordName, &userLangage)

		msg := "**New Post** on forum\nCreate by : `" + discordName + "` (" + discordID + ")\nPost title : `" + newpost.Title + "`"

		message := data.SocketMessage{
			Type: "new_post",
			Content: map[string]string{
				"msg": msg,
			},
		}
		SendMessage(message)
		LogFile(msg)

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

	if newcomment.Content != "" && !strings.Contains(strings.ToLower(newcomment.Content), "<script>") && !strings.Contains(strings.ToLower(newcomment.Content), "</script>") {
		stmt, err := database.Prepare("INSERT INTO Comments(Post_ID, Author, Date, Content) Values(?,?,?,?)")
		CheckErr("1- INSERT NewComment", err)
		stmt.Exec(newcomment.ID, author, time.Now(), newcomment.Content)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Votre commentaire a été créé avec succès.",
			EN: "Your comment has been successfully created.",
		}

		// Récupération des informations de l'utilisateur
		var discordID, discordName, userLangage string
		stmtuser, errdb := database.Prepare(`SELECT DiscordID, DiscordName, userLangage FROM Users WHERE ID = ?`)
		if errdb != sql.ErrNoRows {
			CheckErr("2- Requete DB NewComment", errdb)
		}
		stmtuser.QueryRow(author).Scan(&discordID, &discordName, &userLangage)
		// Récupération des informations de l'utilisateur
		var titlePost string
		stmtpost, errdb := database.Prepare(`SELECT Title FROM Forum WHERE ID = ?`)
		if errdb != sql.ErrNoRows {
			CheckErr("3- Requete DB NewComment", errdb)
		}
		stmtpost.QueryRow(newcomment.ID).Scan(&titlePost)

		msg := "New **Comment** on forum\nCreate by : `" + discordName + "` (" + discordID + ")\nPost title : `" + titlePost + "`"
		message := data.SocketMessage{
			Type: "new_post",
			Content: map[string]string{
				"msg": msg,
			},
		}
		SendMessage(message)
		LogFile(msg)

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

func Modifpost(r *http.Request, author string, database *sql.DB) (notif data.Notif) {
	var modifpost data.Post
	err := json.NewDecoder(r.Body).Decode(&modifpost)
	CheckErr("Erreur de décodage JSON NewPost", err)

	exist := 0
	var discordID, discordName, userLangage, titlepost string
	stmt1, errdb := database.Prepare(`SELECT Forum.ID, Forum.Title, Users.DiscordID, Users.DiscordName, Users.userLangage FROM Forum 
										INNER JOIN Users ON Users.ID = Forum.Author 
										WHERE Forum.ID = ?`)
	if errdb != sql.ErrNoRows {
		CheckErr("1- Requete DB Modifpost", errdb)
	}
	stmt1.QueryRow(modifpost.ID).Scan(&exist, &titlepost, &discordID, &discordName, &userLangage)

	if exist == 0 {
		notif.Type = "error"
		notif.Content = data.ListLanguage{
			FR: "Erreur 500, post inexistant.",
			EN: "500 error, post does not exist.",
		}

	} else if modifpost.Content == "report" {
		LogFile("Post id " + modifpost.ID + " signaler par : " + discordName + " (" + discordID + ")\nTitre : " + titlepost)

		message := data.SocketMessage{
			Type: "report",
			Content: map[string]string{
				"msg": "Post **report** on forum\nPost id `" + modifpost.ID + "`\nReport by : `" + discordName + "` (" + discordID + ")\nPost title : `" + titlepost + "`",
			},
		}
		SendMessage(message)

		notif.Type = "success"
		notif.Content = data.ListLanguage{
			FR: "Le post a été signalé aux administrateurs.",
			EN: "The post has been reported to the administrators.",
		}

	} else {

		requestdb := ""
		switch modifpost.Content {
		case "valid":
			requestdb = "UPDATE Forum SET Valid = 1 WHERE ID = ?"

			notif.Type = "success"
			notif.Content = data.ListLanguage{
				FR: "Post validé avec succès.",
				EN: "Post successfully validated.",
			}

			var message data.SocketMessage
			switch userLangage {
			case "fr":
				message = data.SocketMessage{
					Type: "validate_post",
					Content: map[string]string{
						"msg":    "Bonjour,\nUn administrateur a **validé votre post** sur le forum `Easy Management TW`.\nTitre de votre post : " + titlepost + "`",
						"userid": discordID,
					},
				}
			default: // en
				message = data.SocketMessage{
					Type: "validate_post",
					Content: map[string]string{
						"msg":    "Hello,\nAn administrator has **validated your post** on the `Easy Management TW` forum.\nYour post title : `" + titlepost + "`",
						"userid": discordID,
					},
				}
			}
			SendMessage(message)

		case "archivage":
			requestdb = "UPDATE Forum SET Archive = 1 WHERE ID = ?"

			notif.Type = "success"
			notif.Content = data.ListLanguage{
				FR: "Post archivé avec succès.",
				EN: "Post successfully archived.",
			}

		case "delete":
			requestdb = "DELETE FROM Forum WHERE ID = ?"

			stmtcomments, err := database.Prepare("DELETE FROM Comments WHERE Post_ID = ?")
			CheckErr("2- Update Modifpost", err)
			stmtcomments.Exec(modifpost.ID)

			notif.Type = "success"
			notif.Content = data.ListLanguage{
				FR: "Post et commentaires supprimé avec succès.",
				EN: "Post and comments successfully deleted.",
			}

		default:
			notif.Type = "error"
			notif.Content = data.ListLanguage{
				FR: "Modification du post non gérer.",
				EN: "Modification of the post not managed.",
			}
		}

		if requestdb != "" {
			stmtforum, err := database.Prepare(requestdb)
			CheckErr("3- Update Modifpost", err)
			stmtforum.Exec(modifpost.ID)
		}

	}

	notif.Notif = true
	return notif
}
