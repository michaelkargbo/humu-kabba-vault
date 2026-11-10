'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types/database'

interface CartStore {
  items: CartItem[]
  discountAmount: number
  couponCode: string | null
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variationId?: string) => void
  updateQty: (productId: string, qty: number, variationId?: string) => void
  clearCart: () => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  getSubtotal: () => number
  getTotal: (deliveryFee?: number) => number
  getCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discountAmount: 0,
      couponCode: null,

      addItem: (newItem) => set((state) => {
        const existing = state.items.find(
          i => i.productId === newItem.productId && i.variationId === newItem.variationId
        )
        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === newItem.productId && i.variationId === newItem.variationId
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          }
        }
        return { items: [...state.items, newItem] }
      }),

      removeItem: (productId, variationId) => set((state) => ({
        items: state.items.filter(
          i => !(i.productId === productId && i.variationId === variationId)
        ),
      })),

      updateQty: (productId, qty, variationId) => set((state) => ({
        items: qty <= 0
          ? state.items.filter(i => !(i.productId === productId && i.variationId === variationId))
          : state.items.map(i =>
              i.productId === productId && i.variationId === variationId
                ? { ...i, quantity: qty }
                : i
            ),
      })),

      clearCart: () => set({ items: [], discountAmount: 0, couponCode: null }),

      applyCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),
      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getTotal: (deliveryFee = 0) => Math.max(0, get().getSubtotal() + deliveryFee - get().discountAmount),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'hkv-cart-v1' }
  )
)

