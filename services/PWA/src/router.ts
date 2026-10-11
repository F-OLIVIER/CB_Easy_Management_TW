import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { hasSessionCookie, houseId } from "./stores/session";

declare module "vue-router" {
  interface RouteMeta {
    /** Page réservée aux utilisateurs connectés */
    auth?: boolean;
    /** Page nécessitant une maison sélectionnée */
    house?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  // --- Pages publiques ---
  { path: "/", name: "accueil", component: () => import("./views/AccueilView.vue") },
  { path: "/description", name: "description", component: () => import("./views/DescriptionView.vue") },
  { path: "/mentionlegale", name: "mention", component: () => import("./views/MentionView.vue") },
  { path: "/discord", name: "discord", component: () => import("./views/DiscordCallbackView.vue") },

  // --- Pages utilisateur ---
  { path: "/home", name: "home", component: () => import("./views/HomeView.vue"), meta: { auth: true } },
  { path: "/characterCard", name: "characterCard", component: () => import("./views/CharacterCardView.vue"), meta: { auth: true, house: true } },
  { path: "/caserne", name: "caserne", component: () => import("./views/CaserneView.vue"), meta: { auth: true, house: true } },
  { path: "/Appforum", name: "forum", component: () => import("./views/ForumView.vue"), meta: { auth: true, house: true } },

  // --- Pages gestionnaire ---
  { path: "/creategroup", name: "creategroup", component: () => import("./views/CreateGroupView.vue"), meta: { auth: true, house: true } },
  { path: "/viewGroup", name: "viewGroup", component: () => import("./views/ViewGroupView.vue"), meta: { auth: true, house: true } },
  { path: "/stat", name: "stat", component: () => import("./views/StatView.vue"), meta: { auth: true, house: true } },
  { path: "/consulcaserne", name: "consulcaserne", component: () => import("./views/ConsulCaserneView.vue"), meta: { auth: true, house: true } },
  { path: "/settingbot", name: "settingbot", component: () => import("./views/SettingBotView.vue"), meta: { auth: true, house: true } },

  // --- Page administrateur ---
  { path: "/AppAdmin", name: "admin", component: () => import("./views/AdminView.vue"), meta: { auth: true, house: true } },

  // Anciennes URLs de chargement des groupes type
  { path: "/chargergrouptypeatt", redirect: { path: "/creategroup", query: { load: "att" } } },
  { path: "/chargergrouptypedef", redirect: { path: "/creategroup", query: { load: "def" } } },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
});

router.beforeEach((to) => {
  const logged = hasSessionCookie();
  if (to.name === "accueil" && logged) return "/home";
  if (to.meta.auth && !logged) return "/";
  if (to.meta.house && !houseId.value) return "/home";
  return true;
});
