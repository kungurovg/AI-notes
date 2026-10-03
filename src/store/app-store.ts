import { create } from "zustand";

type AppState = {
  selectedNoteId: string | null;
  selectedChatId: string | null;
  isChatOpen: boolean;
  searchQuery: string;
};

type AppActions = {
  selectNote: (id: string | null) => void;
  selectChat: (id: string | null) => void; // ← добавили
  toggleChat: () => void;
  setSearchQuery: (query: string) => void;
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  selectedNoteId: null,
  isChatOpen: false,
  selectedChatId: null,
  searchQuery: "",

  selectNote: (id) => set({ selectedNoteId: id }),
  selectChat: (id) => set({ selectedChatId: id }), // ← экшен
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
