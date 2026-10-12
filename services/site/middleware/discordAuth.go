package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

// Jeton OAuth2 Discord transmis par le front après la connexion (flux implicite)
type discordToken struct {
	AccessToken string `json:"access_token"`
}

// Réponse de GET /oauth2/@me : application pour laquelle le jeton a été délivré et utilisateur
type discordAuthorization struct {
	Application struct {
		ID string `json:"id"`
	} `json:"application"`
	User struct {
		ID string `json:"id"`
	} `json:"user"`
}

// Causes d'échec de la connexion, pour afficher un message adapté à l'utilisateur (détail dans app.log)
var (
	ErrLoginConfig        = errors.New("configuration de la connexion Discord invalide")
	ErrDiscordRejected    = errors.New("jeton Discord refusé")
	ErrDiscordUnavailable = errors.New("API Discord indisponible")
	ErrDiscordBusy        = errors.New("trop de vérifications Discord en cours")
	ErrUserNotFound       = errors.New("utilisateur absent de la base")
)

var (
	discordIDPattern  = regexp.MustCompile(`^\d{17,20}$`)
	discordHTTPClient = &http.Client{Timeout: 10 * time.Second}
	// Plafond global des vérifications envoyées à Discord (tous clients confondus) : une avalanche de jetons
	// invalides ne doit pas faire bannir l'adresse IP du serveur par Discord (le bot partage cette adresse)
	discordVerifications = NewTokenBucket(20, 2)
)

// API Discord ; DISCORD_API_URL ne sert qu'aux tests (serveur Discord simulé)
func discordAPIURL() string {
	if url := os.Getenv("DISCORD_API_URL"); url != "" {
		return strings.TrimRight(url, "/")
	}
	return "https://discord.com/api"
}

// Identité Discord vérifiée auprès de Discord : l'identifiant n'est jamais pris de la requête du navigateur.
// Le jeton doit avoir été délivré pour notre application (DISCORD_CLIENT_ID), sinon un jeton obtenu
// par une autre application Discord permettrait de se connecter à la place de son propriétaire.
func verifiedDiscordID(token discordToken) (string, error) {
	if token.AccessToken == "" {
		return "", fmt.Errorf("%w : jeton absent", ErrDiscordRejected)
	}
	// Refus par défaut : sans application déclarée, l'origine des jetons ne peut pas être vérifiée
	clientID := os.Getenv("DISCORD_CLIENT_ID")
	if clientID == "" {
		return "", fmt.Errorf("%w : DISCORD_CLIENT_ID non défini, connexion refusée (ID de l'application Discord à renseigner)", ErrLoginConfig)
	}
	if !discordVerifications.Request(1) {
		return "", fmt.Errorf("%w, réessayer plus tard", ErrDiscordBusy)
	}

	req, err := http.NewRequest(http.MethodGet, discordAPIURL()+"/oauth2/@me", nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)

	resp, err := discordHTTPClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("%w : injoignable (%v)", ErrDiscordUnavailable, err)
	}
	defer resp.Body.Close()
	switch {
	case resp.StatusCode == http.StatusTooManyRequests:
		return "", fmt.Errorf("%w (HTTP 429 de Discord)", ErrDiscordBusy)
	case resp.StatusCode >= 500:
		return "", fmt.Errorf("%w (HTTP %d)", ErrDiscordUnavailable, resp.StatusCode)
	case resp.StatusCode != http.StatusOK:
		return "", fmt.Errorf("%w (HTTP %d)", ErrDiscordRejected, resp.StatusCode)
	}

	var authorization discordAuthorization
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&authorization); err != nil {
		return "", fmt.Errorf("%w : réponse illisible (%v)", ErrDiscordUnavailable, err)
	}

	if authorization.Application.ID != clientID {
		return "", fmt.Errorf("%w : jeton délivré pour l'application Discord %s, DISCORD_CLIENT_ID vaut %s", ErrLoginConfig, authorization.Application.ID, clientID)
	}

	if !discordIDPattern.MatchString(authorization.User.ID) {
		return "", fmt.Errorf("%w : identifiant Discord absent de la réponse (scope identify manquant ?)", ErrLoginConfig)
	}
	return authorization.User.ID, nil
}
