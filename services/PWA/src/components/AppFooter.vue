<script setup lang="ts">
import { t } from "../i18n";
</script>

<template>
  <!-- Contenu statique issu des fichiers de traduction (HTML de confiance) -->
  <footer class="footer">
    <div class="footer__sections">
      <section v-for="section in t.footer.sections" :key="section.title" class="footer__section">
        <h4>{{ section.title }}</h4>
        <div v-html="section.content" />
      </section>
    </div>
    <div class="footer__bottom" v-html="t.footer.bottom" />
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 48px;
  padding: 32px 16px calc(24px + env(safe-area-inset-bottom));
  background: rgba(12, 10, 8, 0.92);
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.9rem;
}
.footer__sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  max-width: var(--max-width);
  margin: 0 auto;
}
.footer__section h4 {
  margin: 0 0 8px;
  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1.1rem;
}
.footer__section :deep(ul) {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 4px;
}
.footer__section :deep(p) {
  margin: 0;
}
.footer__bottom {
  max-width: var(--max-width);
  margin: 24px auto 0;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  font-size: 0.8rem;
  text-align: center;
}
</style>
