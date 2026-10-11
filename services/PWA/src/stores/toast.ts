import { reactive } from "vue";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let nextId = 1;

export const toasts = reactive<Toast[]>([]);

export function dismissToast(id: number): void {
  const index = toasts.findIndex((toast) => toast.id === id);
  if (index !== -1) toasts.splice(index, 1);
}

export function showToast(message: string, type: ToastType = "success", duration = 5000): void {
  if (!message) return;
  const id = nextId++;
  toasts.push({ id, message, type: type === "error" || type === "info" ? type : "success" });
  window.setTimeout(() => dismissToast(id), duration);
}
