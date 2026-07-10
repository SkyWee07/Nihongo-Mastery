import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // === Progress Belajar ===
      // Menyimpan ID langkah roadmap yang sudah diselesaikan
      progress: [],
      
      toggleProgress: (id) => {
        const current = get().progress;
        if (current.includes(id)) {
          set({ progress: current.filter(item => item !== id) });
        } else {
          set({ progress: [...current, id] });
        }
      },

      getProgressPercentage: (total) => {
        const count = get().progress.length;
        if (total === 0) return 0;
        return Math.round((count / total) * 100);
      },

      // === Riwayat Kuis ===
      quizHistory: [],

      addQuizResult: (result) => {
        // result: { type, mode, score, total, percentage, date }
        set({ quizHistory: [...get().quizHistory, { ...result, date: new Date().toISOString() }] });
      },

      // === Bookmark ===
      bookmarks: [],

      toggleBookmark: (item) => {
        // item: { id, type, content }
        const current = get().bookmarks;
        const exists = current.find(b => b.id === item.id && b.type === item.type);
        if (exists) {
          set({ bookmarks: current.filter(b => !(b.id === item.id && b.type === item.type)) });
        } else {
          set({ bookmarks: [...current, item] });
        }
      },

      isBookmarked: (id, type) => {
        return get().bookmarks.some(b => b.id === id && b.type === type);
      },

      // === Preferensi User ===
      preferences: {
        showRomaji: false,
        quizCount: 10,
        quizType: 'hiragana',
        quizMode: 'kana-to-romaji',
      },

      updatePreference: (key, value) => {
        set({ preferences: { ...get().preferences, [key]: value } });
      },
    }),
    {
      name: 'nihongo-mastery-storage',
      // Migrasi otomatis dari localStorage lama
      onRehydrateStorage: () => {
        return (state) => {
          // Migrasi data lama dari key 'nihongo-roadmap'
          const oldData = localStorage.getItem('nihongo-roadmap');
          if (oldData && state && state.progress.length === 0) {
            try {
              const parsed = JSON.parse(oldData);
              if (Array.isArray(parsed) && parsed.length > 0) {
                state.progress = parsed;
                localStorage.removeItem('nihongo-roadmap');
              }
            } catch (e) {
              // Abaikan jika data lama rusak
            }
          }
        };
      },
    }
  )
);

export default useStore;
