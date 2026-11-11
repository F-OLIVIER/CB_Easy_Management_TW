# Système de gestion des guerres de territoire multi-plateforme pour le jeu Conqueror's Blade

## 📝 Descriptif

Le projet permet de gérer de façon automatisée les inscriptions aux guerres de territoire (TW) des joueurs pour le jeu [Conqueror's Blade](https://www.conquerorsblade.com) et la préparation des batailles en créant les groupes à l'avance avec les informations nécessaires pour optimiser les groupes.</br>
Le projet se décompose en 2 parties, un bot [Discord](https://discord.com) et un site internet (PWA, installable comme une application sur téléphone et ordinateur), qui ont en commun une base de données SQLite.

Deux langues sont prises en charge, le Français et l'Anglais.

**Accès à la plateforme**
- Le site internet est disponible à l'adresse suivante : <a href="https://easymanagementtw.freivilo.fr" target="_blank">https://easymanagementtw.freivilo.fr</a>
- Le bot Discord peut être inviter sur votre Discord directement depuis le site internet a l'adresse <a href="https://easymanagementtw.freivilo.fr" target="_blank">https://easymanagementtw.freivilo.fr</a>


**Partie 1 : le bot Discord** <br>
Le bot Discord permet aux utilisateurs de s'inscrire via Discord. Les informations d'inscription des joueurs sont enregistrées dans la base de données SQL, les joueurs peuvent ainsi donner la plupart des informations nécessaires à la préparation des TW.</br>
Les commandes sont enregistrées en tant que "Slash Command" Discord et sont accessibles avec une description aux utilisateurs directement sur Discord.

<table align= "center" width="95%">
    <tbody>
        <tr>
            <td><img src="./img/bot_slashcommand.png"></td>
            <td><img src="./img/bot_commanddata.png"></td>
        </tr>
        <tr>
            <td><img src="./img/bot_message_gvg_on.png"></td>
            <td><img src="./img/bot_message_gvg_off.png"></td>
        </tr>
    </tbody>
</table>

__Les permissions utilisé par l'application Discord sont :__
| **Action**                            | **Permission Discord**         |
|--------------------------------------|--------------------------------|
| Se connecter                         | `Connect`                      |
| Envoyer des messages                 | `SendMessages`                 |
| Gérer les messages                   | `ManageMessages`               |
| Voir les anciens messages            | `ReadMessageHistory`           |
| Joindre des fichiers                 | `AttachFiles`                  |
| Intégrer des liens                   | `EmbedLinks`                   |
| Voir les logs du serveur             | `ViewAuditLog`                 |
| Utiliser les commandes de l'application | `UseApplicationCommands`     |


**Partie 2 : le site internet** <br>
Seuls les utilisateurs présents sur le Discord associé peuvent se connecter au site internet. Les rôles Discord permettent de gérer automatiquement les accès privilégiés ou non au site.
Les utilisateurs peuvent indiquer la liste des unités qu'ils ont débloquée en jeu ainsi que le niveau des unités en question. Ils peuvent également mettre à jour les informations de leur héros pour ceux qui n'apprécient pas de le faire via Discord.

Les gestionnaires de la guilde ont accès à plusieurs onglets dont ne dispose pas un simple utilisateur, ils peuvent créer les groupes TW, ils accèdent également à une page de statistique des informations contenu dans la base de données.

<table align= "center" width="95%">
    <tbody>
        <tr>
            <td><img src="./img/site_home.png"></td>
            <td><img src="./img/site_dashboard.png"></td>
        </tr>
        <tr>
            <td><img src="./img/site_groupgvg.png"></td>
            <td><img src="./img/site_charactercard.png"></td>
        </tr>
        <tr>
            <td colspan="2"><img src="./img/site_caserne.png"></td>
        </tr>    
    </tbody>
</table>

___
## ⚙️ Installation & usage

**Avant de pouvoir exécuter le programme :**<br>
Créez votre application Discord sur la [plateforme de développement Discord](https://discord.com/developers/applications) puis, après avoir créé le bot Discord :
  - générez le lien d'invitation du bot et inscrivez-le dans `VITE_LINK_INVITE_BOT` du fichier `.env` ;
  - ajoutez l'adresse de redirection OAuth2 `https://<VOTRE DOMAINE>/discord` (scope `identify`) et inscrivez-la dans `VITE_DISCORD_REDIRECT_URI` du fichier `.env`.

Créez et complétez les 4 fichiers de configuration suivants (ignorés par git) :</br>
```sh
# Fichier `./.env` : utilisateur des conteneurs, ports, application Discord (voir les commentaires du modèle)
cp env.docker.example .env
```
```js
// Fichier `./services/bot/.env`
TOKEN = "<TOKEN DU BOT DISCORD>"
ID_APP = "<ID DE L'APPLICATION DU BOT DISCORD>"
```
```js
// Fichier `./services/bot/config.js`
export const adressdb = "../database/databaseGvG.db";
export const siteInternet = "<ADRESSE DU SITE INTERNET, ex. https://easymanagementtw.freivilo.fr>";
export const ListAdmin = ["<VOS ID DISCORD>"];
export const listUserBan = ["<LES ID DISCORD>"];

// Configuration des paramétres du Discord développeur
export const discordTest_id = "<ID SERVER DISCORD>";
export const discordTest_groupAdminForum = "<ID GROUPE DISCORD>";
export const discordTest_chanForum = "<ID CHAN DISCORD POUR LES NOTIFICATIONS DU FORUM>";
export const discordTest_chanDM = "<ID CHAN DISCORD POUR LES MESSAGES PRIVEE>";
```
```go
// Fichier `./services/site/internal/config.go`
const PORT = "8080"                       // égal à SITE_PORT du fichier .env
const SITE_DOMAIN = "localhost"           // domaine du site : le cookie de connexion lui est lié
const ADRESS_DB = "../database/databaseGvG.db"
const OWNER = "179655652153491456"
```

**Méthode d'éxécution :** <br>
L'ensemble (API Go, bot Discord et PWA) tourne avec Docker Compose :
```sh
docker compose up -d --build
docker compose ps        # état des conteneurs
docker compose logs -f   # journaux
```
Lors du premier lancement, l'API crée la base de données ; le bot attend qu'elle soit prête (healthcheck) avant de démarrer.<br>
La PWA est publiée sur le port `PWA_PORT` du fichier `.env` ; en production, elle est placée derrière un reverse proxy HTTPS (Caddy).<br>
En production, chaque push sur la branche `main` déclenche le déploiement automatique sur le serveur (`.github/workflows/deploy.yml`).

___
## 🔗 Dépendences

**Partie 1 : le bot Discord** <br>
Le serveur utilise la version 23 de [nodeJS](https://nodejs.org/en) est les modules (dépendence) [npm](https://www.npmjs.com) version 11 suivants :<br>
- [cron](https://www.npmjs.com/package/cron)
- [date-fns](https://www.npmjs.com/package/date-fns)
- [discord.js](https://www.npmjs.com/package/discord.js)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [moment-timezone](https://www.npmjs.com/package/moment-timezone)
- [sqlite](https://www.npmjs.com/package/sqlite)
- [sqlite3](https://www.npmjs.com/package/sqlite3)
- [ws](https://www.npmjs.com/package/ws)


**Partie 2 : le site internet** <br>
Le front est une PWA (`services/PWA`) en [Vue](https://vuejs.org) et [TypeScript](https://www.typescriptlang.org), construite avec [Vite](https://vite.dev) et [vite-plugin-pwa](https://vite-pwa-org.netlify.app), servie par [Nginx](https://nginx.org). Elle utilise les librairies suivantes :
- [vue-router](https://router.vuejs.org)
- [dompurify](https://www.npmjs.com/package/dompurify)
- [html2canvas](https://www.npmjs.com/package/html2canvas)
- [quill](https://www.npmjs.com/package/quill)

Le back est une API en [Go](https://go.dev) (`services/site`) qui utilise les librairies suivantes :
- [go-sqlite3](https://github.com/mattn/go-sqlite3)
- [gorilla/websocket](https://github.com/gorilla/websocket)
- [bluemonday](https://github.com/microcosm-cc/bluemonday)
- [uuid](https://github.com/gofrs/uuid)

___
## 🧑‍💻 Authors

+ Fabien OLIVIER
