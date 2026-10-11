<script setup lang="ts">
import { computed, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import { t } from "../i18n";

const route = useRoute();
const m = computed(() => t.value.mention);

// Sections simples (titre + paragraphe HTML) dans l'ordre historique
const simpleSections = computed(() => [
  { id: "cookie", ...m.value.cookie },
  { id: "use", ...m.value.use },
  { id: "legal", ...m.value.legal },
  { id: "storage", ...m.value.storage },
  { id: "rights", ...m.value.rights },
  { id: "rgpd", ...m.value.rgpd },
  { id: "share", ...m.value.share },
  { id: "author", ...m.value.author },
  { id: "image_right", ...m.value.image_right },
  { id: "host", ...m.value.host },
]);

onMounted(async () => {
  if (route.hash) {
    await nextTick();
    document.querySelector(route.hash)?.scrollIntoView({ behavior: "smooth" });
  }
});
</script>

<template>
  <!-- Contenu statique des traductions (HTML de confiance) -->
  <article class="card mention">
    <h2>{{ m.intro.title }}</h2>
    <template v-for="(line, index) in m.intro.content" :key="`intro-${index}`">
      <p v-if="line" v-html="line" />
    </template>
    <ul>
      <li v-for="app in m.listapp" :key="app">
        <strong>{{ app }}</strong>
      </li>
    </ul>

    <h2>{{ m.presentation.title }}</h2>
    <p v-html="m.presentation.content" />

    <h2>{{ m.acces.title }}</h2>
    <template v-for="(line, index) in m.acces.content" :key="`acces-${index}`">
      <p v-if="line" v-html="line" />
    </template>

    <h2>{{ m.Responsabilite.title }}</h2>
    <template v-for="(line, index) in m.Responsabilite.content" :key="`resp-${index}`">
      <p v-if="line" v-html="line" />
    </template>

    <h2>{{ m.collect.title }}</h2>
    <p>{{ m.collect.content }}</p>
    <ul>
      <li v-for="item in m.collect.list" :key="item">
        <strong>{{ item }}</strong>
      </li>
    </ul>

    <section v-for="section in simpleSections" :id="section.id" :key="section.id">
      <h2>{{ section.title }}</h2>
      <p v-html="section.content" />
    </section>
  </article>
</template>

<style scoped>
.mention h2 {
  margin-top: 28px;
}
.mention h2:first-child {
  margin-top: 0;
}
.mention p {
  margin: 0 0 10px;
}
</style>
