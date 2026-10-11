#!/usr/bin/env bash
# Lance les tests e2e de la PWA dans des conteneurs (seul Docker est requis sur la machine).
#
#   e2e/docker/run.sh                      toute la suite
#   e2e/docker/run.sh e2e/groups.spec.ts   arguments transmis à « playwright test »
#
# Rapport HTML et traces des échecs : services/PWA/e2e/.work/report et .work/results
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
WORK="$ROOT/services/PWA/e2e/.work"
COMPOSE=(docker compose -f "$ROOT/docker-compose.e2e.yml")

# Dossiers et fichiers montés : créés ici avec l'utilisateur courant (Docker les créerait en root)
mkdir -p "$WORK/database" "$WORK/weapon" "$WORK/results" "$WORK/report"
touch "$WORK/app.log" "$WORK/logfile.log"

# Contexte de build du backend : sources du site avec le config.go de test.
# Le vrai config.go (ignoré par git) contient le port et le domaine de chaque machine.
rsync -a --delete \
  --exclude node_modules --exclude main --exclude test --exclude '*.log' \
  --exclude public/img --exclude public/video --exclude public/download --exclude public/js \
  "$ROOT/services/site/" "$WORK/site-build/"
cp "$ROOT/services/PWA/e2e/docker/config.e2e.go" "$WORK/site-build/internal/config.go"

export E2E_UID="$(id -u)" E2E_GID="$(id -g)"
cleanup() { "${COMPOSE[@]}" down --remove-orphans >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "Construction des images de test…"
"${COMPOSE[@]}" build --quiet

# Résultats affichés dans la console ; conteneurs et réseau supprimés à la sortie (trap), succès ou échec
"${COMPOSE[@]}" run --rm e2e npx playwright test "$@"
