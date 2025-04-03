import { create } from "zustand";

export type Session = {
  url: string;
  token: string;
};

type SessionStore = {
  session: Session | null;
  override: boolean;
  setSession: (session: Session | null) => void;
  toggleOverride: () => void;
};

export const useSession = create<SessionStore>()((set) => ({
  session: null,
  override: false,
  setSession: (session) => {
    set({ session });
  },
  toggleOverride: () => {
    set((prev) => ({ override: !prev.override }));
  },
}));
