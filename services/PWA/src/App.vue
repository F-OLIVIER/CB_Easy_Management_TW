<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import ToastContainer from "./components/ToastContainer.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import PwaPrompt from "./components/PwaPrompt.vue";
</script>

<template>
  <AppHeader />
  <main class="page">
    <RouterView />
  </main>
  <AppFooter />
  <ToastContainer />
  <ConfirmDialog />
  <PwaPrompt />
</template>
