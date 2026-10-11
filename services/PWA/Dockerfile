# Front PWA — build Vite puis service statique par Nginx (+ proxy vers le backend Go)

FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .

# Variables publiques intégrées au bundle au moment du build
ARG VITE_DISCORD_CLIENT_ID=""
ARG VITE_DISCORD_REDIRECT_URI=""
ARG VITE_LINK_INVITE_BOT=""
ENV VITE_DISCORD_CLIENT_ID=$VITE_DISCORD_CLIENT_ID \
    VITE_DISCORD_REDIRECT_URI=$VITE_DISCORD_REDIRECT_URI \
    VITE_LINK_INVITE_BOT=$VITE_LINK_INVITE_BOT
RUN npm run build

FROM nginx:1.27-alpine
# Le point d'entrée Nginx remplace ${SITE_UPSTREAM} au démarrage
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
