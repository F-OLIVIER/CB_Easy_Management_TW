# Easy Management TW — Front PWA

Nouveau front du site, séparé du backend Go (`services/site`) et installable comme application (PWA).

- **Stack** : [Vue 3](https://vuejs.org) + TypeScript + [Vite](https://vite.dev) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app) (Workbox)
- **Backend** : inchangé. La PWA consomme les mêmes routes `/api/*` que l'ancien front ; elle tourne sur un **autre port (8082 par défaut)** et relaie (proxy) vers le backend Go sur 8080.
- **Base de données** : aucune modification.

## Démarrage rapide

```sh
cd services/PWA
npm install
cp env.example .env        # puis compléter les valeurs (voir ci-dessous)

# 1. lancer le backend Go habituel (port 8080)
# 2. lancer la PWA :
npm run dev                # http://localhost:8082 (rechargement à chaud)
```

## Configuration (`.env`)

| Variable | Rôle |
| --- | --- |
| `PWA_PORT` | Port de la PWA (défaut `8082`) |
| `BACKEND_URL` | Backend Go vers lequel sont relayés `/api`, `/img`, `/video`, `/download` (défaut `http://localhost:8080`) |
| `VITE_DISCORD_CLIENT_ID` | ID de l'application Discord |
| `VITE_DISCORD_REDIRECT_URI` | URL de retour OAuth2, ex. `http://localhost:8082/discord` |
| `VITE_LINK_INVITE_BOT` | Lien d'invitation du bot (bouton « Ajouter à Discord ») |

> ⚠️ **Discord** : ajouter `VITE_DISCORD_REDIRECT_URI` dans le portail développeur Discord
> (*OAuth2 > Redirects*), sinon la connexion échoue. L'ancienne URL (`…:8080/discord`) peut rester en place
> pendant la période de validation.

Les variables `VITE_*` sont intégrées au bundle : elles sont publiques, n'y mettez aucun secret.

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement + proxy backend |
| `npm run build` | Vérification TypeScript (`vue-tsc`) puis build de production dans `dist/` |
| `npm run preview` | Sert `dist/` sur `PWA_PORT` avec le même proxy (test de la version de prod et du service worker) |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm run icons` | Régénère les icônes PWA depuis `services/site/public/img/Logo_EMTW.webp` (Python + Pillow) |

## Architecture

```
src/
├── api/          types.ts (miroir des structs Go), client.ts (fetch + retry), usePage.ts (chargement/droits)
├── stores/       session (utilisateur, maison), toast (notifications), confirm (fenêtre de confirmation)
├── i18n/         fr.json / en.json (repris du site + section "pwa"), langue réactive sans rechargement
├── utils/        units (tri/influence des unités), groups (logique des groupes TW), format (dates, nettoyage HTML)
├── components/   en-tête, pied de page, éditeur de caserne, éditeur riche (Quill), invite d'installation PWA
└── views/        une vue par page (mêmes URLs que l'ancien site)
```

Pages : `/`, `/description`, `/mentionlegale`, `/discord`, `/home`, `/characterCard`, `/caserne`,
`/creategroup`, `/viewGroup`, `/stat`, `/consulcaserne`, `/settingbot`, `/Appforum`, `/AppAdmin`.

### Compatibilité avec le backend actuel

Le front reproduit volontairement certains comportements attendus par le backend Go :

- `saveGroupInDB` ignore la 1re ligne envoyée (ex-ligne d'en-tête du DOM) : une ligne vide est ajoutée en tête.
- Les noms de groupe ne sont enregistrés que si le 1er élément de `namegroup` est non vide : seuls les noms saisis sont envoyés.
- Le limiteur de débit global (5 req/s) répond `200` avec un corps vide : le client réessaie automatiquement.
- Sans cookie, le backend plante (réponse vide) : le client ne l'appelle pas et renvoie vers l'accueil.
- Le cookie de session `user_token` est partagé avec l'ancien front (les cookies ignorent le port) ; le `localStorage`
  (`selectedLang`, `user_house`) reprend les mêmes clés mais reste propre à chaque origine (port compris).

### PWA

- Installable (manifeste, icônes, bannière « Installer l'application »), mise à jour proposée à l'utilisateur.
- App shell en cache (consultation rapide, démarrage hors-ligne) ; l'API n'est **jamais** mise en cache
  (`NetworkOnly`), les images du backend et avatars Discord sont mis en cache (`StaleWhileRevalidate`).
- Le service worker n'est actif qu'en HTTPS (ou sur `localhost`).

## Mise en production (après validation)

1. `npm run build` → fichiers statiques dans `dist/`.
2. Servir `dist/` en HTTPS avec un repli SPA (`try_files $uri /index.html`) et relayer `/api`, `/img`, `/video`,
   `/download` vers le backend Go. Exemple Nginx :

   ```nginx
   location / { root /chemin/services/PWA/dist; try_files $uri /index.html; }
   location ~ ^/(api|img|video|download)/ { proxy_pass http://127.0.0.1:8080; proxy_set_header Host $host; }
   location = /sw.js { root /chemin/services/PWA/dist; add_header Cache-Control "no-cache"; }
   ```

3. Mettre à jour l'URL de retour Discord et `SITE_DOMAIN` (domaine du cookie) si le domaine change.

Pour une validation rapide sur le serveur sans Nginx : `npm run build && npm run preview` (port `PWA_PORT`).
