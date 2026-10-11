# Lanceur des tests e2e : Node, navigateurs Playwright et sources de la PWA.
# La version de l'image doit rester égale à celle de @playwright/test (package.json).
FROM mcr.microsoft.com/playwright:v1.64.0-noble

# Même arborescence que le dépôt : les tests retrouvent ../database et ../site (montés en volume)
WORKDIR /e2e/services/PWA
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .

# Le conteneur tourne avec l'UID de l'hôte : Vite doit pouvoir écrire ses caches dans node_modules
RUN chmod 0777 node_modules

ENV HOME=/tmp \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NODE_OPTIONS=--disable-warning=ExperimentalWarning

CMD ["npx", "playwright", "test"]
