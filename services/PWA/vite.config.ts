import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// Chemins servis par le backend Go (services/site) : API + fichiers dynamiques
// (images des unités uploadées par les admins, armes, vidéo, téléchargements).
const BACKEND_PATHS = ["/api", "/img", "/video", "/download"];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.BACKEND_URL || "http://localhost:8080";
  const port = Number(env.PWA_PORT || 8082);

  const proxy: Record<string, ProxyOptions> = Object.fromEntries(
    BACKEND_PATHS.map((path) => [path, { target: backend, changeOrigin: false }]),
  );

  return {
    plugins: [
      // Les URLs absolues (/img, /video...) sont servies par le backend : pas d'import Vite
      vue({ template: { transformAssetUrls: { includeAbsolute: false } } }),
      VitePWA({
        registerType: "prompt",
        includeAssets: ["favicon.ico", "icons/apple-touch-icon.png"],
        manifest: {
          id: "/",
          name: "Easy Management TW",
          short_name: "EMTW",
          description: "Gestion des guerres de territoire (TW) de Conqueror's Blade",
          lang: "fr",
          start_url: "/home",
          scope: "/",
          display: "standalone",
          orientation: "any",
          background_color: "#14110d",
          theme_color: "#14110d",
          categories: ["games", "utilities"],
          icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,webp,svg,woff2}"],
          navigateFallback: "/index.html",
          // Les routes du backend ne doivent jamais renvoyer l'app shell
          navigateFallbackDenylist: BACKEND_PATHS.map((path) => new RegExp(`^${path}`)),
          runtimeCaching: [
            {
              // Données toujours fraîches : jamais de cache pour l'API
              urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
              handler: "NetworkOnly",
            },
            {
              // Images d'armes remplaçables depuis l'administration : réseau d'abord, cache hors-ligne
              urlPattern: ({ url }) => url.pathname.startsWith("/img/weapon/"),
              handler: "NetworkFirst",
              options: {
                cacheName: "emtw-weapons",
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 60, purgeOnQuotaError: true },
              },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith("/img/"),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "emtw-images",
                expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === "https://cdn.discordapp.com",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "emtw-discord-avatars",
                // Réponses opaques (no-cors) : comptées lourdement dans le quota du navigateur
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7, purgeOnQuotaError: true },
              },
            },
          ],
        },
      }),
    ],
    server: { port, strictPort: true, host: true, proxy },
    preview: { port, strictPort: true, host: true, proxy },
    build: { target: "es2022", chunkSizeWarningLimit: 700 },
  };
});
