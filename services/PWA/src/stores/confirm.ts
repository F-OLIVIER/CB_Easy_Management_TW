import { reactive } from "vue";

interface ConfirmState {
  open: boolean;
  message: string;
  resolve: ((value: boolean) => void) | null;
}

export const confirmState = reactive<ConfirmState>({ open: false, message: "", resolve: null });

/** Ouvre la fenêtre de confirmation et résout `true` si l'utilisateur valide */
export function confirmDialog(message: string): Promise<boolean> {
  confirmState.resolve?.(false);
  return new Promise((resolve) => {
    confirmState.message = message;
    confirmState.resolve = resolve;
    confirmState.open = true;
  });
}

export function closeConfirm(value: boolean): void {
  confirmState.resolve?.(value);
  confirmState.resolve = null;
  confirmState.open = false;
}
