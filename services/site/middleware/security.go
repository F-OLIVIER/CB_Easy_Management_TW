package utils

import (
	"net/http"
	"net/url"
	"strings"

	"github.com/microcosm-cc/bluemonday"
)

// -------------------------------------------------------------------------
// Nettoyage des contenus saisis par les utilisateurs
// -------------------------------------------------------------------------

// Contenu riche du forum : exactement les formats de l'éditeur Quill (gras, italique, souligné, barré,
// titres, liens, images). Aucun script, gestionnaire d'événement, style ni attribut class/id
// (l'ancien front utilise getElementById : un id dans un post pourrait détourner ses éléments).
var richTextPolicy = func() *bluemonday.Policy {
	policy := bluemonday.NewPolicy()
	policy.AllowElements("p", "br", "strong", "b", "em", "i", "u", "s", "strike", "h1", "h2", "blockquote", "ul", "ol", "li", "span")
	policy.AllowAttrs("href").OnElements("a")
	policy.AllowURLSchemes("http", "https", "mailto")
	policy.RequireParseableURLs(true)
	policy.RequireNoReferrerOnLinks(true)
	policy.AddTargetBlankToFullyQualifiedLinks(true)
	policy.AllowImages()
	// Images collées dans l'éditeur (base64), comme le permettait déjà le forum
	policy.AllowDataURIImages()
	return policy
}()

var tagChars = strings.NewReplacer("<", "", ">", "")

// SanitizeRichText nettoie un contenu HTML destiné à être affiché tel quel (forum)
func SanitizeRichText(html string) string {
	return strings.TrimSpace(richTextPolicy.Sanitize(html))
}

// PlainText retire les chevrons d'un texte simple (titres, commentaires, noms) :
// l'ancien front en affiche certains avec innerHTML, aucune balise ne doit pouvoir s'y glisser
func PlainText(text string) string {
	return strings.TrimSpace(tagChars.Replace(text))
}

// -------------------------------------------------------------------------
// Protection CSRF
// -------------------------------------------------------------------------

// CrossOrigin indique si la requête vient d'un autre site que celui qui l'a reçue.
// Les navigateurs envoient l'en-tête Origin sur les requêtes POST ; sans lui (client non navigateur),
// la requête n'est pas bloquée ici : elle reste soumise au cookie de session.
func CrossOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return false
	}
	parsed, err := url.Parse(origin)
	if err != nil || parsed.Host == "" {
		return true
	}
	return !strings.EqualFold(parsed.Host, r.Host)
}

// RejectCrossOrigin répond 403 à une requête venant d'un autre site ; renvoie true si elle a été rejetée
func RejectCrossOrigin(w http.ResponseWriter, r *http.Request) bool {
	if !CrossOrigin(r) {
		return false
	}
	LogFile("Requête d'une autre origine refusée : " + r.Header.Get("Origin") + " -> " + r.Host + r.URL.Path)
	http.Error(w, "Forbidden", http.StatusForbidden)
	return true
}
