import { create } from "zustand";

interface AlertState {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
}

interface AlertStore {
  alert: AlertState;
  showAlert: (message: string, type: AlertState["type"]) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alert: {
    message: "",
    type: "info",
    visible: false,
  },
  showAlert: (message, type) =>
    set({
      alert: {
        message,
        type,
        visible: true,
      },
    }),
  hideAlert: () =>
    set({
      alert: {
        message: "",
        type: "info",
        visible: false,
      },
    }),
}));
