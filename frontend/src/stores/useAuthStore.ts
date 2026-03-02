import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  userId: number | null;
  hasHydrated: boolean;

  actions: {
    login: (token: string) => void;
    logout: () => void;
    setUserId: (id: number | null) => void;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      accessToken: null,
      isAuthenticated: false,
      userId: null,
      hasHydrated: false,

      actions: {
        login: (token) =>
          set((state) => {
            state.accessToken = token;
            state.isAuthenticated = true;
            state.userId = null;
          }),
        logout: () =>
          set((state) => {
            state.accessToken = null;
            state.isAuthenticated = false;
            state.userId = null;
          }),
        setUserId: (id) =>
          set((state) => {
            state.userId = id;
          }),
      },
    })),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Auth store rehydration failed:", error);
        }
        if (state) {
          state.hasHydrated = true;
        }
      },
    },
  ),
);

export const useAuthActions = () => useAuthStore((state) => state.actions);
export const useAuthToken = () => useAuthStore((state) => state.accessToken);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useUserId = () => useAuthStore((s) => s.userId);
