package utils

import (
	"database/sql"
	data "easemanagementtw/internal"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)

// Cookie de session : HttpOnly (illisible par JavaScript, donc par une faille XSS) et SameSite=Lax
// (non envoyé par les requêtes POST d'autres sites : protection CSRF).
const SessionCookieName = "user_token"

// Cookie indicateur, sans valeur sensible : permet aux fronts de savoir qu'une session existe
const SessionFlagCookieName = "user_logged"

func sessionCookies(value string, expires time.Time) []*http.Cookie {
	session := &http.Cookie{
		Name:     SessionCookieName,
		Value:    value,
		Expires:  expires,
		Domain:   data.SITE_DOMAIN,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	flag := &http.Cookie{
		Name:     SessionFlagCookieName,
		Value:    "1",
		Expires:  expires,
		Domain:   data.SITE_DOMAIN,
		Path:     "/",
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	}
	if value == "" { // suppression
		for _, cookie := range []*http.Cookie{session, flag} {
			cookie.Value = ""
			cookie.Expires = time.Unix(0, 0)
			cookie.MaxAge = -1
		}
	}
	return []*http.Cookie{session, flag}
}

// Connexion d'un utilisateur ; l'erreur renvoyée enveloppe l'une des causes Err* (voir discordAuth.go)
func CheckUser(w http.ResponseWriter, r *http.Request, database *sql.DB) error {
	// Le front envoie le jeton Discord ; l'identité est vérifiée auprès de Discord
	var token discordToken
	err := json.NewDecoder(io.LimitReader(r.Body, 1<<16)).Decode(&token)
	CheckErr("Erreur de décodage JSON CheckUser", err)

	discordID, err := verifiedDiscordID(token)
	if err != nil {
		CheckErr("Connexion Discord refusée (CheckUser)", err)
		return err
	}

	var id string
	stmt, err := database.Prepare("SELECT ID FROM Users WHERE DiscordID = ?")
	CheckErr("db Prepare user_db_uuid : ", err)
	if err := stmt.QueryRow(discordID).Scan(&id); err != nil {
		return fmt.Errorf("%w (DiscordID %s)", ErrUserNotFound, discordID)
	}

	userUUID := uuid.Must(uuid.NewV4())
	new_uuid := userUUID.String()
	dateCookie := time.Now().Add(720 * time.Hour) // 1 mois
	cookies := sessionCookies(new_uuid, dateCookie)
	for _, cookie := range cookies {
		if err := cookie.Valid(); err != nil {
			CheckErr("invalid cookie (SITE_DOMAIN ?) : ", err)
			return fmt.Errorf("%w : cookie de session invalide (%v)", ErrLoginConfig, err)
		}
	}

	SessionLogger(w, discordID, cookies, database)
	return nil
}

// Fonction qui crée le cookie et sa correspondance dans la db
func SessionLogger(w http.ResponseWriter, discordId string, cookies []*http.Cookie, database *sql.DB) {
	session := cookies[0]
	// Convertir en string avec un format spécifique
	layout := "2006-01-02 15:04:05"
	strDate_cookie := session.Expires.Format(layout)

	stmt, err := database.Prepare("UPDATE Users SET uuid = ?, DateCookie = ? WHERE DiscordID = ?")
	CheckErr("sessionlogger (SessionLogger): ", err)
	stmt.Exec(session.Value, strDate_cookie, discordId)
	for _, cookie := range cookies {
		http.SetCookie(w, cookie)
	}
}

// Fonction qui compare le cookie utilisateur avec la map de gestion des cookies
func CheckToken(c *http.Cookie, database *sql.DB) bool {
	// Récupération des informations cookie de la db
	var id, uuid, dateCookie string
	stmt, err := database.Prepare("SELECT ID, uuid, DateCookie FROM Users WHERE uuid = ?")
	CheckErr("db Prepare user_db_uuid : ", err)
	err1 := stmt.QueryRow(c.Value).Scan(&id, &uuid, &dateCookie)

	if err1 == nil && dateCookie != "" {
		// Format de date pour convertir en time.Time
		layout := "2006-01-02 15:04:05"
		origine_date_cookie, err := time.Parse(layout, dateCookie)
		if err != nil {
			fmt.Println("Erreur de parsing date cookie:", err)
			return false
		}

		if uuid == c.Value && time.Now().Before(origine_date_cookie) {
			return true
		}
	}

	return false
}

// Fonction de déconnexion (supression du cookie) et suppression de l'uuid dans la db
func Logout(w http.ResponseWriter, r *http.Request, database *sql.DB) {
	// Session invalidée en base (si le navigateur en présente une), cookies supprimés dans tous les cas
	if c, err := r.Cookie(SessionCookieName); err == nil && c.Value != "" {
		stmt, err := database.Prepare("UPDATE Users SET uuid = '', DateCookie = '' WHERE uuid = ?")
		CheckErr("2- logout :", err)
		if err == nil {
			stmt.Exec(c.Value)
		}
	}
	for _, cookie := range sessionCookies("", time.Time{}) {
		http.SetCookie(w, cookie)
	}
}
