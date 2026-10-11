# Tests e2e de la PWA

Tests de bout en bout du front PWA avec [Playwright](https://playwright.dev) : un vrai navigateur pilote la PWA,
qui dialogue avec le **vrai backend Go** sur une **base de test générée**.

Tout s'exécute dans des conteneurs Docker : seul Docker est nécessaire sur la machine, sans Node, navigateur ni Go.
La base réelle et les images du projet ne sont jamais modifiées.

## Lancer les tests

Depuis `services/PWA` :

```sh
npm run test:e2e                                  # toute la suite
bash e2e/docker/run.sh                            # équivalent, sans npm
bash e2e/docker/run.sh e2e/groups.spec.ts         # un seul fichier
bash e2e/docker/run.sh -g "nom de groupe effacé"  # tests dont le titre correspond
```

Tous les arguments sont transmis à `playwright test` (`-g`, `--project mobile`, `--repeat-each 3`…).

**Au premier lancement**, Docker télécharge l'image Playwright (environ 2 Go) et construit les images de test.
Les lancements suivants réutilisent le cache et prennent environ 1 minute.

### Résultats

- Chaque test s'affiche dans la console avec `✓` (réussi) ou `✘` (échoué), suivi d'un récapitulatif
  (`41 passed`).
- À la fin, **les conteneurs et le réseau de test sont supprimés automatiquement**, que les tests réussissent ou
  échouent.
- Le code de sortie vaut `0` si tous les tests passent et `1` sinon : il peut servir dans une intégration continue.
- En cas d'échec, la console indique la cause. La capture d'écran, la trace et le contexte de la page sont
  enregistrés dans `e2e/.work/results/<test>/`.

```sh
npm run test:e2e:report                              # rapport HTML du dernier lancement (Node requis)
npx playwright show-trace e2e/.work/results/<test>/trace.zip   # rejouer un échec pas à pas
```

## Fonctionnement

```
run.sh ─┬─ prépare e2e/.work/ (dossiers, contexte de build du backend)
        ├─ docker compose -f docker-compose.e2e.yml build
        ├─ docker compose run --rm e2e npx playwright test
        └─ docker compose down   (toujours, même après un échec)

 réseau easy_management_e2e (isolé, sans accès à Internet)
 ┌──────────────────────────────────────────┐        ┌─────────────────────────────┐
 │ e2e  (image Playwright)                  │        │ site-e2e (backend Go)       │
 │  Chromium ──► PWA (Vite :9182) ──proxy───┼──────► │  :8080  /api /img           │
 │  tests Playwright                        │        │  config.go de test          │
 └───────────────┬──────────────────────────┘        └──────────────┬──────────────┘
                 │        e2e/.work/database (partagé)              │
                 └──────── base de test : remise à zéro, vérifs ────┘
```

| Élément | Rôle |
| --- | --- |
| `../../../docker-compose.e2e.yml` | Les conteneurs et le réseau de test (projet Compose `emtw-e2e`) : backend, PWA de production (`pwa-e2e`, Nginx), lanceur |
| `docker/run.sh` | Point d'entrée : préparation, build, lancement, nettoyage |
| `docker/runner.Dockerfile` | Image du lanceur : `mcr.microsoft.com/playwright` + sources et dépendances de la PWA |
| `docker/config.e2e.go` | `config.go` du backend de test : port `8080`, domaine `localhost`, propriétaire de test |
| `support/seed.ts` | Construction de la base de test et données des comptes |
| `support/global-setup.ts` | Avant la suite : base de test, copie des images d'armes, attente du backend |
| `support/fixtures.ts` | Fixtures et outils communs aux tests |
| `support/db.ts` | Remise à zéro et lecture directe de la base |
| `support/env.ts` | Chemins, ports et constantes |
| `../playwright.config.ts` | Configuration Playwright (projets, délais, serveur Vite) |

### Faux serveur Discord

Le backend vérifie chaque connexion auprès de Discord (`GET /oauth2/@me`). Dans les tests, il interroge le
conteneur `discord-mock` (`docker/discord-mock.mjs`, variable `DISCORD_API_URL`) :

| Jeton | Réponse |
| --- | --- |
| `jeton-<discordId>` | jeton valide, délivré pour l'application de test (`100000000000000000`) |
| `jeton-autre-app-<discordId>` | jeton valide, délivré pour une autre application (doit être refusé) |
| autre | 401 (jeton invalide) |

Dans le navigateur, `mockDiscord()` simule la page d'autorisation Discord et renvoie `jeton-<id>`.

### Backend de test

`site-e2e` est construit avec le **Dockerfile de production** du site (`services/site/Dockerfile`). Seul le
`config.go` change : celui de chaque machine (ignoré par git) contient son propre port et son propre domaine,
alors que les tests ont besoin d'une configuration identique partout. `run.sh` copie les sources du site dans
`e2e/.work/site-build/` et y place `docker/config.e2e.go`.

Le backend n'a accès à aucun bot Discord : les messages envoyés au bot (forum, nouvelle arme…) échouent
immédiatement, sans effet sur les tests.

### Isolation

- **Base de données :** une base générée à chaque lancement dans `e2e/.work/database`. La base réelle
  (`services/database/databaseGvG.db`) n'est jamais montée.
- **Images :** `services/site/public/img` est monté en lecture seule. Le dossier des images d'armes est une copie,
  pour le test d'envoi d'image.
- **Discord :** l'OAuth2 et l'API sont simulés dans le navigateur ; aucune requête ne part vers Discord.
- **Réseau :** le réseau `easy_management_e2e` est interne, sans accès à Internet et séparé de `easy_management`.
- **Fichiers :** les conteneurs tournent avec l'UID de l'utilisateur qui lance `run.sh`, donc tout ce qu'ils
  écrivent dans `e2e/.work/` reste modifiable et supprimable.

## Données de test

`support/seed.ts` construit la base comme en production :

- les tables communes avec les scripts SQL de `services/database`, ceux qu'exécute le backend ;
- les tables de la maison avec les mêmes requêtes que le bot lors de la commande `/config`.

Un changement de schéma dans ces scripts est donc repris automatiquement.

**Maison :** « Maison Test », serveur Discord `111111111111111111`. Les votes sont activés et le bouton « En retard »
est affiché.

| Clé (`USERS.…`) | Nom | Rôle | Inscription TW | Session |
| --- | --- | --- | --- | --- |
| `member` | Alice | Utilisateur | présent | `loginAs("member")` |
| `officer` | Bob | Gestionnaire | présent | `loginAs("officer")` |
| `admin` | Carole | Gestionnaire + administrateur | en retard | `loginAs("admin")` |
| `owner` | Owen | Propriétaire (`OWNER` du config.go de test) | non inscrit | `loginAs("owner")` |
| `absent` | Damien | Utilisateur | absent | aucune |

- **Casernes :** Alice a les unités 1 (level 30) et 2 (level 20), Bob les unités 1 (level 15) et 3 (level 30),
  Carole l'unité 2 (level 30). L'unité 1 est « Gardes varègues ».
- **Forum** (`FORUM.…`) :
  - `active` : un post validé, écrit par Bob ;
  - `pending` : un post en attente de validation, écrit par Alice ;
  - `xss` : un post validé dont le contenu contient du HTML piégé.

**La base est remise dans cet état avant chaque test.** Les tests sont donc indépendants les uns des autres et
peuvent être lancés seuls, dans n'importe quel ordre.

## Écrire un test

Importer `test` et `expect` depuis `./support/fixtures`, et non depuis `@playwright/test`, pour bénéficier des
fixtures :

```ts
import { expect, HOUSE, queryOne, test, toast, USERS } from "./support/fixtures";

test("le level mis à jour est enregistré", async ({ page, loginAs }) => {
  await loginAs("member");
  await page.goto("/characterCard");

  await page.getByPlaceholder("Nouveau level").fill("1300");
  await page.getByRole("button", { name: "Mettre à jour mon personnage" }).click();

  await expect(toast(page)).toContainText("level a été mis à jour");
  expect(queryOne("SELECT Lvl FROM Users WHERE ID = ?", USERS.member.id)).toEqual({ Lvl: 1300 });
});
```

| Outil | Rôle |
| --- | --- |
| `loginAs(role)` | Ouvre une session (cookie du compte de test) et sélectionne la maison de test |
| `mockDiscord(identité, { tamperState })` | Simule Discord pour la connexion. Renvoie `authorizeParams()` (paramètres envoyés à Discord) |
| `confirm()` | Valide la fenêtre de confirmation de la PWA |
| `toast(page)` | Dernière notification affichée |
| `queryOne(sql, …)` / `queryAll(sql, …)` | Lecture directe de la base de test, pour vérifier ce qui a été enregistré |
| `USERS`, `HOUSE`, `FORUM` | Données de test |

**Automatique pour chaque test :** la base est remise à zéro, et le test échoue si une erreur JavaScript non
interceptée survient dans la page.

### Bonnes pratiques

- **Vérifier l'effet en base**, pas seulement l'affichage : c'est ce qui garantit la compatibilité avec le backend.
- **Sélecteurs :** préférer les rôles et les libellés visibles (`getByRole`, `getByLabel`, `getByPlaceholder`) aux
  classes CSS.
- **Deux actions successives :** attendre la réponse du serveur
  (`page.waitForResponse(…/api/…/)`) plutôt que la notification. Celle de l'action précédente peut encore
  être affichée (voir `save()` dans `groups.spec.ts`).
- **Contraintes natives des champs** (`min`, `max`, `pattern`) : le navigateur bloque l'envoi avant la PWA.
  Vérifier `input.validity` et l'absence de requête, plutôt qu'une notification (voir `character.spec.ts`).
- **Projets :** `mobile.spec.ts` s'exécute sur un téléphone simulé (Pixel 7) ; `security.spec.ts` sur l'image de
  production de la PWA (`pwa-e2e` : build + Nginx, adresse `http://pwa-e2e`) ; `backend-security.spec.ts` sur les
  deux ; les autres sur le serveur Vite, sur ordinateur.
- **Limiteur de débit :** le backend limite chaque client à 5 requêtes par seconde (réponse 429). Les appels
  directs à l'API depuis un test doivent réessayer sur 429 (voir `call()` dans `backend-security.spec.ts`).

## Couverture

| Fichier | Couverture |
| --- | --- |
| `public.spec.ts` | Accueil, changement de langue, pages publiques, adresse inconnue, pages privées sans session |
| `auth.spec.ts` | Connexion Discord (droits demandés, `state`, session en base, logo à jour), `state` falsifié, compte inconnu, déconnexion |
| `access.spec.ts` | Droits par rôle : tuiles, accès direct par l'adresse, données de gestion refusées par le serveur, sections propriétaire jamais envoyées à un administrateur |
| `character.spec.ts` | Fiche personnage, level, influence invalide, inscription TW |
| `caserne.spec.ts` | Caserne (level, doctrine, rechargement), recherche, caserne d'un joueur par un gestionnaire |
| `groups.spec.ts` | Groupes TW : composition, enregistrement, prévisualisation, joueurs proposés, effacement d'un nom, groupe type |
| `management.spec.ts` | Statistique (tri, commentaires), paramétrage du bot (ID invalide, enregistrement, aucun changement) |
| `forum.spec.ts` | Publication, validation par un administrateur, réponse, HTML piégé non exécuté |
| `admin.spec.ts` | Remplacement de l'image d'une arme, ajout d'une arme |
| `mobile.spec.ts` | Affichage sur téléphone sans débordement horizontal |
| `backend-security.spec.ts` | **Protections du backend** (via Vite et via Nginx) : identité Discord vérifiée (sans jeton, jeton d'une autre application, jeton invalide), cookies `HttpOnly`/`SameSite`, requêtes d'un autre site refusées, déconnexion en GET refusée, droits administrateur/propriétaire, HTML nettoyé par le serveur, limiteur de débit par client |
| `security.spec.ts` | **Image de production (Nginx)** : en-têtes de sécurité sur pages, fichiers, API et images relayées ; aucune ressource bloquée par la CSP ni domaine tiers ; éditeur du forum, aperçu d'image et export des groupes fonctionnels sous CSP |

## Configuration

| Réglage | Valeur | Pourquoi |
| --- | --- | --- |
| Workers | `1` | Les tests partagent la base, et le backend limite chaque client à 5 requêtes par seconde |
| Délai par test / par assertion | 30 s / 10 s | `playwright.config.ts` |
| Nouvel essai en cas d'échec | 0 (1 si `CI` est défini) | Pour ne pas masquer un test instable en local |
| Service worker | bloqué | Chaque test part d'un navigateur vierge |
| PWA de test | port `9182`, dans le conteneur `e2e` | Aucun port publié sur la machine |

## Maintenance

- **Mise à jour de Playwright :** la version de l'image dans `docker/runner.Dockerfile`
  (`mcr.microsoft.com/playwright:vX.Y.Z-noble`) doit rester égale à celle de `@playwright/test` dans
  `package.json`.
- **Nouvelle table propre à une maison** (créée par le bot) : reproduire la requête du bot dans
  `support/seed.ts`.
- **Constante ajoutée à `internal/config.go`** : l'ajouter aussi dans `docker/config.e2e.go`, sinon l'image de test
  ne compile pas.
- **Nettoyage complet :**
  ```sh
  rm -rf e2e/.work
  docker rmi emtw-e2e/site emtw-e2e/runner
  ```

## Dépannage

| Problème | Solution |
| --- | --- |
| `permission denied` sur le socket Docker | Ajouter l'utilisateur au groupe `docker`, ou lancer avec les droits suffisants |
| `Backend de test injoignable` | Démarrer le backend seul pour lire ses journaux (après un premier `run.sh`) : `docker compose -f ../../docker-compose.e2e.yml up site-e2e`, puis `Ctrl+C` et `docker compose -f ../../docker-compose.e2e.yml down` |
| Erreur de compilation Go dans `site-e2e` | Une constante de `internal/config.go` manque dans `docker/config.e2e.go` |
| `Executable doesn't exist` / version de navigateur | Versions de l'image Playwright et de `@playwright/test` différentes (voir Maintenance) |
| Fichiers de `e2e/.work` appartenant à `root` | Créés par un lancement hors `run.sh` : `sudo rm -rf e2e/.work` puis relancer avec `run.sh` |
| Test instable | `bash e2e/docker/run.sh <fichier> --repeat-each 5` pour le reproduire, puis rejouer la trace de l'échec |
