# Bot Discord — Easy Management TW

# Dépendances (sqlite3 est un module natif : outils de compilation disponibles en secours)
FROM node:24-bookworm AS deps
WORKDIR /app/bot
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

FROM node:24-bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends tzdata \
    && rm -rf /var/lib/apt/lists/*

# Même arborescence que sur l'hôte : la base reste accessible via ../database/databaseGvG.db
WORKDIR /app/bot
COPY --from=deps /app/bot/node_modules ./node_modules
COPY . .
RUN mkdir -p logs /app/database

# Le TOKEN Discord est fourni à l'exécution (env_file), jamais intégré à l'image
ENV NODE_ENV=production \
    TZ=Europe/Paris \
    HOME=/tmp

# 8081 : websocket interne utilisé par le site (non publié sur l'hôte)
EXPOSE 8081
CMD ["node", "Main.js"]
