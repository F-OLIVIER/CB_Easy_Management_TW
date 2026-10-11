<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { postJson } from "../api/client";
import type { Lang } from "../api/types";
import { loginWithDiscord } from "../config";
import { lang, LANG_OPTIONS, setLang, t } from "../i18n";
import { currentHouse, hasSessionCookie, houseId, isLogged, logout, session } from "../stores/session";
import logo from "../assets/logo.webp";
import HouseLogo from "./HouseLogo.vue";

const router = useRouter();

const user = computed(() => (isLogged.value ? session.user : null));
const avatar = computed(() => user.value?.Photo || "/img/noavatar.jpg");

async function changeLang(event: Event) {
  const value = (event.target as HTMLSelectElement).value as Lang;
  setLang(value);
  if (isLogged.value && hasSessionCookie()) {
    const house = encodeURIComponent(houseId.value ?? "null");
    postJson(`/api/updatelanguage/?house=${house}`, { Language: value }).catch(console.error);
  }
}

async function disconnect() {
  await logout();
  router.push("/");
}
</script>

<template>
  <header class="header">
    <RouterLink :to="user ? '/home' : '/'" class="header__brand" :title="user ? 'Dashboard' : 'Accueil / Home'">
      <img :src="logo" alt="" width="44" height="44" />
      <span class="header__title">Easy Management TW</span>
    </RouterLink>

    <div class="header__actions">
      <span v-if="currentHouse" class="header__house" :title="currentHouse.House_name">
        <HouseLogo :src="currentHouse.House_logo" :name="currentHouse.House_name" :size="26" />
        <span>{{ currentHouse.House_name }}</span>
      </span>

      <select class="header__lang" :value="lang" aria-label="Langue / Language" @change="changeLang">
        <option v-for="option in LANG_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>

      <template v-if="user">
        <img class="header__avatar" :src="avatar" :alt="user.Username" width="40" height="40" />
        <span class="header__username">{{ user.Username }}</span>
        <button type="button" class="btn btn--ghost btn--sm" @click="disconnect">{{ t.commun.disconnected }}</button>
      </template>
      <button v-else-if="!hasSessionCookie()" type="button" class="btn btn--discord btn--sm" @click="loginWithDiscord">{{ t.commun.connect }}</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px max(16px, env(safe-area-inset-left));
  padding-top: max(10px, env(safe-area-inset-top));
  background: rgba(20, 17, 13, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--accent);
  text-decoration: none;
  min-width: 0;
}
.header__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  white-space: nowrap;
}
.header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.header__house {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.85rem;
  color: var(--muted);
  max-width: 200px;
}
.header__house > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header__lang {
  width: auto;
  padding: 6px 8px;
}
.header__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  object-fit: cover;
}
.header__username {
  font-weight: 600;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 900px) {
  .header__house,
  .header__username {
    display: none;
  }
}
@media (max-width: 560px) {
  .header__title {
    display: none;
  }
  .header__avatar {
    width: 34px;
    height: 34px;
  }
}
</style>
