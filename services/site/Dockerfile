# Site internet : API Go (le front est la PWA, conteneur pwa) — Easy Management TW
# go-sqlite3 nécessite CGO : build et exécution sur la même base glibc (Debian bookworm).

FROM golang:1.27-bookworm AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -trimpath -ldflags="-s -w" -o /out/main ./cmd/main.go

FROM debian:bookworm-slim
# ca-certificates : le serveur Go vérifie les connexions auprès de https://discord.com
# socat : relais du websocket vers le bot (voir CMD) ; curl : healthcheck du conteneur
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata socat curl \
    && rm -rf /var/lib/apt/lists/*

# Même arborescence que sur l'hôte : la base reste accessible via ../database/databaseGvG.db.
# public/img, public/download et public/video sont montés depuis l'hôte (docker-compose.yml).
WORKDIR /app/site
COPY --from=build /out/main ./main
RUN mkdir -p public/img public/download public/video /app/database

ENV TZ=Europe/Paris

# Le code envoie ses messages au bot sur ws://localhost:8081 : socat relaie ce port local
# vers le conteneur du bot (BOT_HOST) sur le réseau Docker. Le port d'écoute du site est
# celui de PORT dans internal/config.go.
CMD ["sh", "-c", "socat TCP-LISTEN:8081,bind=127.0.0.1,fork,reuseaddr TCP:${BOT_HOST:-bot}:8081 & exec ./main"]
