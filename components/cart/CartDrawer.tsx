'use client'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { useEffect } from 'react'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQty, removeItem, getSubtotal, getCount } = useCart()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-vault-card border-l border-vault-border flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-vault-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-gold" />
            <span className="font-heading font-semibold text-vault-text">My Bag ({getCount()})</span>
          </div>
          <button onClick={onClose} className="text-vault-muted hover:text-gold transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="text-vault-muted mx-auto mb-4" />
              <p className="text-vault-muted mb-4">Your bag is empty</p>
              <Link href="/shop" onClick={onClose} className="btn-gold inline-block text-sm py-2 px-6">Start Shopping</Link>
            </div>
          ) : (
            items.map(item => (
              <div key={`${item.productId}-${item.variationId}`} className="flex gap-3 bg-vault-surface rounded-xl p-3">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-vault-text line-clamp-2">{item.name}</p>
                  {item.variationLabel && <p className="text-xs text-vault-muted mt-0.5">{item.variationLabel}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gold font-bold text-sm">{formatPrice(item.price)}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1, item.variationId)}
                        className="w-6 h-6 rounded-full bg-vault-card flex items-center justify-center text-vault-muted hover:text-gold transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1, item.variationId)}
                        className="w-6 h-6 rounded-full bg-vault-card flex items-center justify-center text-vault-muted hover:text-gold transition-colors">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeItem(item.productId, item.variationId)}
                        className="w-6 h-6 rounded-full text-red-400 hover:text-red-300 transition-colors ml-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-vault-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-vault-muted">Subtotal</span>
              <span className="font-bold text-gold text-lg">{formatPrice(getSubtotal())}</span>
            </div>
            <p className="text-xs text-vault-muted">Delivery fee calculated at checkout</p>
            <Link href="/cart" onClick={onClose} className="btn-gold w-full text-center block py-3">
              Proceed to Checkout
            </Link>
            <button onClick={onClose} className="btn-outline-gold w-full py-2 text-sm">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

