'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  ids: string[]
  toggle: (productId: string) => void
  isWished: (productId: string) => boolean
  clear: () => void
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => set((state) => ({
        ids: state.ids.includes(productId)
          ? state.ids.filter(id => id !== productId)
          : [...state.ids, productId],
      })),
      isWished: (productId) => get().ids.includes(productId),
      clear: () => set({ ids: [] }),
    }),
    { name: 'hkv-wishlist-v1' }
  )
)

