# Site internet (backend Go + ancien front) — Easy Management TW
# go-sqlite3 nécessite CGO : build et exécution sur la même base glibc (Debian bookworm).

FROM golang:1.24-bookworm AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -trimpath -ldflags="-s -w" -o /out/main ./cmd/main.go

# Node est requis à l'exécution : le serveur obfusque src/js au démarrage (npx javascript-obfuscator)
FROM node:24-bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends tzdata socat \
    && rm -rf /var/lib/apt/lists/*

# Même arborescence que sur l'hôte : la base reste accessible via ../database/databaseGvG.db
WORKDIR /app/site
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm cache clean --force

COPY index.html discord.html ./
COPY src ./src
COPY public ./public
COPY --from=build /out/main ./main

# public/js est régénéré à chaque démarrage, quel que soit l'utilisateur (APP_UID) du conteneur
RUN mkdir -p public/js public/img /app/database && chmod 0777 public/js

ENV TZ=Europe/Paris \
    HOME=/tmp \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# Le code envoie ses messages au bot sur ws://localhost:8081 : socat relaie ce port local
# vers le conteneur du bot (BOT_HOST) sur le réseau Docker. Le port d'écoute du site est
# celui de PORT dans internal/config.go.
CMD ["sh", "-c", "socat TCP-LISTEN:8081,bind=127.0.0.1,fork,reuseaddr TCP:${BOT_HOST:-bot}:8081 & exec ./main"]
