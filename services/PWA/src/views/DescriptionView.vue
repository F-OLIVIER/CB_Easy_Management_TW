<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { t } from "../i18n";
import { assetUrl } from "../utils/units";

// Index de l'image affichée dans chaque carrousel
const carouselIndex = reactive<Record<number, number>>({});
const lightbox = ref<{ section: number; image: number } | null>(null);

const sections = computed(() => t.value.descriptionSections);

function imagesOf(section: number): string[] {
  const images = (sections.value[section] as { images?: string[] }).images;
  return images ?? [];
}

function move(section: number, step: number) {
  const count = imagesOf(section).length;
  carouselIndex[section] = ((carouselIndex[section] ?? 0) + step + count) % count;
}

function moveLightbox(step: number) {
  if (!lightbox.value) return;
  const count = imagesOf(lightbox.value.section).length;
  lightbox.value.image = (lightbox.value.image + step + count) % count;
}

function onKey(event: KeyboardEvent) {
  if (!lightbox.value) return;
  if (event.key === "Escape") lightbox.value = null;
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
}

onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div class="stack">
    <section class="card">
      <h1>{{ t.descriptionIntro.title }}</h1>
      <template v-for="(line, index) in t.descriptionIntro.content" :key="index">
        <p v-if="line.trim()" class="intro-line">{{ line }}</p>
      </template>
      <video class="video" controls playsinline preload="metadata">
        <source src="/video/presentation_emtw.mp4" type="video/mp4" />
      </video>
    </section>

    <section v-for="(section, sIndex) in sections" :key="section.title" class="card">
      <h2>{{ section.title }}</h2>
      <div class="table-wrap">
        <table class="table commands">
          <tbody>
            <tr v-for="[command, description] in section.commands" :key="command">
              <th scope="row">{{ command }}</th>
              <!-- Contenu statique des traductions -->
              <td class="commands__desc" v-html="description" />
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="imagesOf(sIndex).length" class="carousel">
        <button type="button" class="btn btn--ghost btn--sm" aria-label="Précédent" @click="move(sIndex, -1)">◀</button>
        <img
          class="carousel__img"
          :src="assetUrl(imagesOf(sIndex)[carouselIndex[sIndex] ?? 0])"
          :alt="section.title"
          loading="lazy"
          @click="lightbox = { section: sIndex, image: carouselIndex[sIndex] ?? 0 }"
        />
        <button type="button" class="btn btn--ghost btn--sm" aria-label="Suivant" @click="move(sIndex, 1)">▶</button>
      </div>
    </section>

    <div v-if="lightbox" class="modal-backdrop" @click.self="lightbox = null">
      <button type="button" class="btn btn--ghost" aria-label="Précédent" @click="moveLightbox(-1)">◀</button>
      <img class="lightbox__img" :src="assetUrl(imagesOf(lightbox.section)[lightbox.image])" alt="" @click="lightbox = null" />
      <button type="button" class="btn btn--ghost" aria-label="Suivant" @click="moveLightbox(1)">▶</button>
    </div>
  </div>
</template>

<style scoped>
.intro-line {
  margin: 0 0 10px;
}
.video {
  display: block;
  width: min(800px, 100%);
  margin: 16px auto 0;
  border-radius: var(--radius);
}
.commands th {
  position: static;
  width: 30%;
  min-width: 140px;
  font-family: ui-monospace, monospace;
  white-space: normal;
}
.commands__desc :deep(span) {
  display: block;
}
.commands__desc :deep(ul) {
  margin: 4px 0;
}
.carousel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
.carousel__img {
  max-height: 340px;
  max-width: calc(100% - 120px);
  border-radius: var(--radius-sm);
  cursor: zoom-in;
  object-fit: contain;
}
.lightbox__img {
  max-width: calc(100% - 140px);
  max-height: 90vh;
  margin: 0 12px;
  border-radius: var(--radius-sm);
  cursor: zoom-out;
}
</style>
