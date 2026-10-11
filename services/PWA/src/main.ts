import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
// Polices hébergées avec l'application (aucune requête vers Google Fonts : adresse IP des visiteurs non transmise).
// Sous-ensembles latin uniquement : caractères français et anglais.
import "@fontsource/agbalumo/latin-400.css";
import "@fontsource/agbalumo/latin-ext-400.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-ext-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-ext-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-ext-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-ext-700.css";
import "./styles/main.css";

createApp(App).use(router).mount("#app");
