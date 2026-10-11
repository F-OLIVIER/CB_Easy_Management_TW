<script setup lang="ts">
import { dismissToast, toasts } from "../stores/toast";
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`" role="status">
        <span>{{ toast.message }}</span>
        <button type="button" class="toast__close" aria-label="Fermer" @click="dismissToast(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(420px, calc(100vw - 32px));
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius);
  background: var(--surface-solid);
  border-left: 4px solid var(--success);
  box-shadow: var(--shadow);
  text-align: left;
}
.toast--error {
  border-left-color: var(--danger);
}
.toast--info {
  border-left-color: var(--accent);
}
.toast span {
  flex: 1;
}
.toast__close {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
</style>
