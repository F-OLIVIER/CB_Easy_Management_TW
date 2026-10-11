<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { notify, postJson } from "../api/client";
import { OAUTH_STATE_KEY } from "../config";
import type { ApiResponse } from "../api/types";
import { lang } from "../i18n";
import { showToast } from "../stores/toast";

const router = useRouter();

const MESSAGES = {
  cancelled: { fr: "Connexion Discord annulée.", en: "Discord login cancelled." },
  failed: { fr: "La connexion avec Discord a échoué.", en: "Discord login failed." },
};

// Retour du flux OAuth2 implicite : le jeton est dans le fragment de l'URL
onMounted(async () => {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = fragment.get("access_token");
  const tokenType = fragment.get("token_type") ?? "Bearer";
  const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  // Le jeton ne doit pas rester dans l'historique
  history.replaceState(null, "", window.location.pathname);

  // `state` absent ou différent : connexion non initiée par cet onglet (CSRF de connexion)
  if (!accessToken || !expectedState || fragment.get("state") !== expectedState) {
    showToast(MESSAGES.cancelled[lang.value], "error");
    return router.replace("/");
  }

  try {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `${tokenType} ${accessToken}` },
    });
    if (!response.ok) throw new Error(`Discord ${response.status}`);
    const { id, username } = (await response.json()) as { id: string; username: string };

    // Le backend pose le cookie de session si l'utilisateur existe en base
    const data = await postJson<ApiResponse>("/api/discord", { id, username });
    notify(data.Gestion?.Notification);
    router.replace(data.Gestion?.Logged ? "/home" : "/");
  } catch (error) {
    console.error(error);
    showToast(MESSAGES.failed[lang.value], "error");
    router.replace("/");
  }
});
</script>

<template>
  <div class="spinner" role="status" aria-label="Connexion en cours" />
</template>
