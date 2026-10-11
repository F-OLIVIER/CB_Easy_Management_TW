<script setup lang="ts">
import { computed } from "vue";
import { closeConfirm, confirmState } from "../stores/confirm";
import { lang } from "../i18n";

const labels = computed(() => (lang.value === "fr" ? { ok: "Confirmer", cancel: "Annuler" } : { ok: "Confirm", cancel: "Cancel" }));
</script>

<template>
  <div v-if="confirmState.open" class="modal-backdrop" @click.self="closeConfirm(false)" @keydown.esc="closeConfirm(false)">
    <div class="modal modal--small" role="alertdialog" aria-modal="true">
      <p class="confirm__message">{{ confirmState.message }}</p>
      <div class="row row--end">
        <button type="button" class="btn btn--ghost" @click="closeConfirm(false)">{{ labels.cancel }}</button>
        <button type="button" class="btn btn--primary" autofocus @click="closeConfirm(true)">{{ labels.ok }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm__message {
  margin: 0 0 20px;
  font-size: 1.05rem;
}
</style>
