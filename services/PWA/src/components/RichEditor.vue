<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const props = defineProps<{ placeholder?: string }>();
const html = defineModel<string>({ default: "" });

const container = ref<HTMLElement | null>(null);
let quill: Quill | null = null;

onMounted(() => {
  if (!container.value) return;
  quill = new Quill(container.value, {
    theme: "snow",
    placeholder: props.placeholder,
    modules: {
      toolbar: [["bold", "italic", "underline", "strike"], ["link", "image"], [{ header: 1 }, { header: 2 }]],
    },
  });
  if (html.value) quill.clipboard.dangerouslyPasteHTML(html.value);
  quill.on("text-change", () => {
    html.value = quill?.root.innerHTML ?? "";
  });
});

onBeforeUnmount(() => {
  quill = null;
});

defineExpose({
  clear() {
    quill?.setContents([]);
    html.value = "";
  },
});
</script>

<template>
  <div class="rich-editor">
    <div ref="container" />
  </div>
</template>

<style scoped>
.rich-editor {
  text-align: left;
}
.rich-editor :deep(.ql-toolbar) {
  border-color: var(--border-strong);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: var(--surface-3);
}
.rich-editor :deep(.ql-container) {
  min-height: 160px;
  border-color: var(--border-strong);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  background: rgba(10, 8, 6, 0.65);
  color: var(--text);
  font: inherit;
}
.rich-editor :deep(.ql-editor.ql-blank::before) {
  color: var(--muted);
}
.rich-editor :deep(.ql-stroke) {
  stroke: var(--text);
}
.rich-editor :deep(.ql-fill) {
  fill: var(--text);
}
.rich-editor :deep(.ql-picker-label) {
  color: var(--text);
}
</style>
