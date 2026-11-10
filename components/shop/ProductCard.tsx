'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice, cn } from '@/lib/utils'
import { Product } from '@/types/database'
import { toast } from '@/components/ui/Toast'

interface ProductCardProps {
  product: Product
  view?: 'grid' | 'list'
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const addItem = useCart(s => s.addItem)
  const { toggle, isWished } = useWishlist()
  const wished = isWished(product.id)

  const images = Array.isArray(product.images)
    ? product.images as string[]
    : typeof product.images === 'object' && product.images
    ? Object.values(product.images as Record<string, string>)
    : []
  const mainImage = images[0] || '/placeholder.jpg'
  const hoverImage = images[1] || mainImage
  const inStock = product.stock_quantity > 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!inStock) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      quantity: 1,
      slug: product.slug,
    })
    toast.success(`${product.name} added to bag`)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    toggle(product.id)
    toast.info(wished ? 'Removed from wishlist' : 'Added to wishlist ❤️')
  }

  if (view === 'list') {
    return (
      <Link href={`/product/${product.slug}`} className="card-vault flex gap-4 p-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <Image src={mainImage} alt={product.name} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gold mb-1">{product.brand || 'Humu Kabba'}</div>
          <h3 className="font-semibold text-vault-text text-sm line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-gold font-bold">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-vault-muted text-sm line-through">{formatPrice(product.original_price)}</span>
            )}
          </div>
        </div>
        <button onClick={handleAddToCart} disabled={!inStock} className="btn-gold text-sm py-2 px-4 self-center whitespace-nowrap">
          Add
        </button>
      </Link>
    )
  }

  return (
    <Link href={`/product/${product.slug}`} className="card-vault group block">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-vault-surface">
        <Image src={mainImage} alt={product.name} fill className="object-cover transition-opacity duration-500 group-hover:opacity-0" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        <Image src={hoverImage} alt={product.name} fill className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new && <span className="badge-new">NEW</span>}
          {product.discount_percent > 0 && <span className="badge-gold">-{product.discount_percent}%</span>}
          {product.featured && <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">HOT</span>}
          {!inStock && <span className="bg-vault-muted text-vault-bg text-xs font-bold px-2 py-0.5 rounded-full">SOLD OUT</span>}
        </div>

        {/* Overlay actions */}
        <div className="product-overlay">
          <button onClick={handleAddToCart} disabled={!inStock}
            className="w-10 h-10 rounded-full bg-gold text-vault-bg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
            aria-label="Add to bag">
            <ShoppingBag size={16} />
          </button>
          <button onClick={handleWishlist}
            className={cn('w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all',
              wished ? 'bg-red-500 text-white' : 'bg-vault-bg/80 text-vault-text')}
            aria-label="Wishlist">
            <Heart size={16} className={wished ? 'fill-current' : ''} />
          </button>
          <Link href={`/product/${product.slug}`}
            className="w-10 h-10 rounded-full bg-vault-bg/80 text-vault-text flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Quick view">
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-xs text-vault-muted mb-1">{product.brand || 'Humu Kabba'}</div>
        <h3 className="text-sm font-medium text-vault-text line-clamp-2 mb-2 leading-snug">{product.name}</h3>

        {/* Rating (placeholder) */}
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={10} className={i <= 4 ? 'fill-gold text-gold' : 'text-vault-border'} />
          ))}
          <span className="text-xs text-vault-muted ml-1">(12)</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-gold font-bold text-sm">{formatPrice(product.price)}</div>
            {product.original_price && (
              <div className="text-vault-muted text-xs line-through">{formatPrice(product.original_price)}</div>
            )}
          </div>
          <button onClick={handleAddToCart} disabled={!inStock}
            className={cn('p-2 rounded-full transition-all',
              inStock
                ? 'bg-gold/10 text-gold hover:bg-gold hover:text-vault-bg'
                : 'bg-vault-border text-vault-muted cursor-not-allowed')}
            aria-label="Add to bag">
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </Link>
  )
}

