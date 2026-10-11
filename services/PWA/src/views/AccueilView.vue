<script setup lang="ts">
import { LINK_INVITE_BOT, loginWithDiscord } from "../config";
import { t } from "../i18n";
import logo from "../assets/logo.webp";
import discordLogo from "../assets/discord.webp";
</script>

<template>
  <section class="hero">
    <img class="hero__logo" :src="logo" alt="Easy Management TW" width="180" height="180" />
    <h1>Easy Management TW</h1>
    <!-- Texte statique des traductions -->
    <p class="hero__text" v-html="t.accueil.description" />

    <div class="row row--center hero__actions">
      <button type="button" class="btn btn--discord" @click="loginWithDiscord">
        <img :src="discordLogo" alt="" width="22" height="22" />
        {{ t.commun.connect }}
      </button>
      <RouterLink class="btn btn--ghost" to="/description">{{ t.accueil.explain }}</RouterLink>
      <a v-if="LINK_INVITE_BOT" class="btn btn--primary" :href="LINK_INVITE_BOT" target="_blank" rel="noopener">
        {{ t.accueil.adddiscord }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: clamp(24px, 8vh, 80px) 0;
}
.hero__logo {
  width: clamp(120px, 22vw, 180px);
  height: auto;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.6));
}
.hero h1 {
  font-size: clamp(2.2rem, 6vw, 3.6rem);
  margin: 8px 0 0;
}
.hero__text {
  max-width: 680px;
  font-size: 1.1rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 22px;
}
.hero__actions {
  margin-top: 12px;
}
</style>
