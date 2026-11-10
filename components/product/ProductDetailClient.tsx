'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, MessageCircle, Plus, Minus, ArrowLeft } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice, buildWhatsAppLink, WA_NUMBER } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

export default function ProductDetailClient({ product }: { product: any }) {
  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Default')
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Default')
  const [quantity, setQuantity] = useState(1)

  const addItem = useCart(s => s.addItem)
  const { toggle, isWished } = useWishlist()
  const wished = isWished(product.id)

  const inStock = product.stock_quantity > 0

  function handleAddToCart() {
    if (!inStock) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[activeImage] || product.images?.[0] || '/assets/dresses.jpg',
      quantity,
      slug: product.slug,
      variationId: `${selectedColor}-${selectedSize}`,
      variationLabel: `${selectedColor} · ${selectedSize}`,
    })
    toast.success(`Added ${quantity} × ${product.name} to bag!`)
  }

  const waInquiryMessage = `Hi Humu Kabba Vault! I am interested in:
🛍️ *${product.name}*
🏷️ Price: NLe ${product.price}
🎨 Color: ${selectedColor}
📏 Size: ${selectedSize}
🔢 Qty: ${quantity}
Link: https://humu-kabba-vault.vercel.app/product/${product.slug}`

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-vault-muted hover:text-gold mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] max-h-[550px] w-full rounded-2xl overflow-hidden bg-vault-surface border border-vault-border">
            <Image
              src={product.images?.[activeImage] || '/assets/dresses.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 badge-gold text-sm py-1 px-3">
                -{product.discount_percent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === idx ? 'border-gold scale-105' : 'border-vault-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-gold tracking-widest uppercase">{product.brand || 'Humu Kabba'}</span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-vault-text mt-1">{product.name}</h1>
            
            {/* Reviews summary */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-gold">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className={i <= 5 ? 'fill-gold' : 'text-vault-border'} />
                ))}
              </div>
              <span className="text-sm font-semibold text-vault-text">5.0</span>
              <span className="text-xs text-vault-muted">(18 verified reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 p-4 rounded-xl bg-vault-card border border-vault-border">
            <span className="font-heading text-3xl font-bold text-gold">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-base text-vault-muted line-through">{formatPrice(product.original_price)}</span>
            )}
            <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full ml-auto">
              {inStock ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
            </span>
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-vault-text">
                Color: <span className="text-gold font-semibold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c: string) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedColor === c
                        ? 'bg-gold text-vault-bg font-bold shadow-md'
                        : 'bg-vault-card border border-vault-border text-vault-muted hover:text-vault-text'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-vault-text">
                Size / Variant: <span className="text-gold font-semibold">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedSize === s
                        ? 'bg-gold text-vault-bg font-bold shadow-md'
                        : 'bg-vault-card border border-vault-border text-vault-muted hover:text-vault-text'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-vault-border rounded-xl bg-vault-card p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-vault-muted hover:text-gold"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-vault-text">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-vault-muted hover:text-gold"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="btn-gold flex-1 py-3.5 flex items-center justify-center gap-2 text-base font-bold shadow-lg"
              >
                <ShoppingBag size={20} />
                {inStock ? 'Add to Bag' : 'Out of Stock'}
              </button>

              <button
                onClick={() => toggle(product.id)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                  wished ? 'bg-red-500 text-white border-red-500' : 'bg-vault-card border-vault-border text-vault-muted hover:text-vault-text'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={20} className={wished ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Direct WhatsApp Order */}
            <a
              href={buildWhatsAppLink(WA_NUMBER, waInquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-center"
            >
              <MessageCircle size={20} /> Order Instantly via WhatsApp
            </a>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-vault-border text-center">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-vault-card border border-vault-border">
              <Truck size={20} className="text-gold" />
              <span className="text-xs font-semibold text-vault-text">Fast Delivery</span>
              <span className="text-[10px] text-vault-muted">Freetown & Provinces</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-vault-card border border-vault-border">
              <ShieldCheck size={20} className="text-gold" />
              <span className="text-xs font-semibold text-vault-text">100% Quality</span>
              <span className="text-[10px] text-vault-muted">Inspected Boutique</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-vault-card border border-vault-border">
              <RotateCcw size={20} className="text-gold" />
              <span className="text-xs font-semibold text-vault-text">Easy Exchange</span>
              <span className="text-[10px] text-vault-muted">Within 48 hours</span>
            </div>
          </div>

          {/* Description & Specs */}
          <div className="space-y-4 pt-4 border-t border-vault-border">
            <h3 className="font-heading text-lg font-semibold text-vault-text">Description</h3>
            <p className="text-vault-muted text-sm leading-relaxed">{product.description}</p>

            {product.details && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-2">Specifications</h4>
                <ul className="list-disc list-inside text-sm text-vault-muted space-y-1">
                  {product.details.map((d: string, i: number) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
