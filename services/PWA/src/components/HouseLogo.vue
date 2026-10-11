<script setup lang="ts">
import { computed, ref, watch } from "vue";

// Logo d'une maison (voir houseLogoUrl) ; si l'image est absente ou introuvable, on affiche l'initiale.
const props = defineProps<{ src?: string | null; name: string; size?: number }>();

const failed = ref(false);
watch(
  () => props.src,
  () => (failed.value = false),
);

const showImage = computed(() => Boolean(props.src) && !failed.value);
const initial = computed(() => props.name.trim().charAt(0).toUpperCase() || "?");
const dimension = computed(() => `${props.size ?? 40}px`);
</script>

<template>
  <img v-if="showImage" class="house-logo" :src="src!" :alt="name" referrerpolicy="no-referrer" @error="failed = true" />
  <span v-else class="house-logo house-logo--initial" role="img" :aria-label="name">{{ initial }}</span>
</template>

<style scoped>
.house-logo {
  width: v-bind(dimension);
  height: v-bind(dimension);
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
}
.house-logo--initial {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-3);
  border: 1px solid var(--border-strong);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: calc(v-bind(dimension) * 0.5);
  line-height: 1;
}
</style>
