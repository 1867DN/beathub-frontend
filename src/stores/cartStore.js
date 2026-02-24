import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart')) || [],

  addItem: (product) => {
    const items = get().items
    const existing = items.find((item) => item.id === product.id)
    const maxStock = product.stock ?? existing?.stock ?? Infinity

    const addQty = product.quantity ?? 1

    if (existing) {
      if (existing.quantity >= maxStock) return // no superar stock
      set({
        items: items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(maxStock, item.quantity + addQty) }
            : item
        ),
      })
    } else {
      set({ items: [...items, { ...product, quantity: Math.min(maxStock, addQty) }] })
    }
    localStorage.setItem('cart', JSON.stringify(get().items))
  },

  removeItem: (productId) => {
    const items = get().items.filter((item) => item.id !== productId)
    set({ items })
    localStorage.setItem('cart', JSON.stringify(items))
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) quantity = 1
    const items = get().items
    const item = items.find((i) => i.id === productId)
    const maxStock = item?.stock ?? Infinity
    const capped = Math.min(quantity, maxStock)
    const updated = items.map((i) =>
      i.id === productId ? { ...i, quantity: capped } : i
    )
    set({ items: updated })
    localStorage.setItem('cart', JSON.stringify(updated))
  },

  clearCart: () => {
    set({ items: [] })
    localStorage.removeItem('cart')
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
  },
}))

