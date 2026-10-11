<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRegisterSW } from "virtual:pwa-register/vue";
import { lang } from "../i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const { needRefresh, updateServiceWorker } = useRegisterSW();

const installEvent = ref<BeforeInstallPromptEvent | null>(null);
const installDismissed = ref(sessionStorage.getItem("pwa-install-dismissed") === "1");

const text = computed(() =>
  lang.value === "fr"
    ? { update: "Une nouvelle version est disponible.", reload: "Mettre à jour", install: "Installer l'application sur cet appareil ?", installBtn: "Installer", later: "Plus tard" }
    : { update: "A new version is available.", reload: "Update", install: "Install the app on this device?", installBtn: "Install", later: "Later" },
);

function onBeforeInstall(event: Event) {
  event.preventDefault();
  installEvent.value = event as BeforeInstallPromptEvent;
}

async function install() {
  if (!installEvent.value) return;
  await installEvent.value.prompt();
  await installEvent.value.userChoice;
  installEvent.value = null;
}

function dismissInstall() {
  installDismissed.value = true;
  sessionStorage.setItem("pwa-install-dismissed", "1");
}

onMounted(() => window.addEventListener("beforeinstallprompt", onBeforeInstall));
onBeforeUnmount(() => window.removeEventListener("beforeinstallprompt", onBeforeInstall));
</script>

<template>
  <div v-if="needRefresh" class="pwa-banner" role="status">
    <span>{{ text.update }}</span>
    <button type="button" class="btn btn--primary btn--sm" @click="updateServiceWorker(true)">{{ text.reload }}</button>
  </div>
  <div v-else-if="installEvent && !installDismissed" class="pwa-banner" role="status">
    <span>{{ text.install }}</span>
    <button type="button" class="btn btn--ghost btn--sm" @click="dismissInstall">{{ text.later }}</button>
    <button type="button" class="btn btn--primary btn--sm" @click="install">{{ text.installBtn }}</button>
  </div>
</template>

<style scoped>
.pwa-banner {
  position: fixed;
  left: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 90;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  max-width: min(460px, calc(100vw - 32px));
  padding: 12px 14px;
  border-radius: var(--radius);
  background: var(--surface-solid);
  border: 1px solid var(--accent);
  box-shadow: var(--shadow);
}
.pwa-banner span {
  flex: 1 1 200px;
}
</style>
