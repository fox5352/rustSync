import { create } from "zustand";

export type Session = {
  url: string;
  token: string;
};

type SessionStore = {
  session: Session | null;
  overide: boolean;
  setSession: (session: Session | null) => void;
  toggleOveride: () => void;
};

export const useSession = create<SessionStore>()((set) => ({
  session: null,
  overide: false,
  setSession: (session) => {
    set({ session });
  },
  toggleOveride: () => {
    set((prev) => ({ overide: !prev.overide }));
  },
}));
