import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_COMPARE = 3;

export const usePreferencesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      compare: [],
      toggleFavorite: (car) =>
        set((state) => {
          const exists = state.favorites.find((fav) => fav.id === car.id);
          const favorites = exists
            ? state.favorites.filter((fav) => fav.id !== car.id)
            : [...state.favorites, car];
          return { favorites };
        }),
      toggleCompare: (car) =>
        set((state) => {
          const exists = state.compare.find((item) => item.id === car.id);
          if (exists) {
            return { compare: state.compare.filter((item) => item.id !== car.id) };
          }
          if (state.compare.length >= MAX_COMPARE) {
            return state;
          }
          return { compare: [...state.compare, car] };
        }),
      clearCompare: () => set({ compare: [] })
    }),
    {
      name: 'car-preferences'
    }
  )
);
