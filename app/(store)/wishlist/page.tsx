'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

// Sample products map
const SAMPLES: Record<string, any> = {
  s1: { id: 's1', name: 'Evening Gown Collection', price: 850, image: '/assets/dresses.jpg', slug: 'evening-gown' },
  s2: { id: 's2', name: 'Designer Handbag Set', price: 650, image: '/assets/bags.jpg', slug: 'designer-handbag' },
  s3: { id: 's3', name: 'Luxury Perfume Bundle', price: 420, image: '/assets/beauty.jpg', slug: 'luxury-perfume' },
  s4: { id: 's4', name: 'Full Cosmetics Kit', price: 380, image: '/assets/beauty.jpg', slug: 'cosmetics-kit' },
  s5: { id: 's5', name: 'Stiletto Heel Shoes', price: 490, image: '/assets/shoes.jpg', slug: 'stiletto-heels' },
  s6: { id: 's6', name: 'Crystal Phone Case', price: 180, image: '/assets/cases/crystal_shell.jpg', slug: 'crystal-phone-case' },
}

export default function WishlistPage() {
  const { ids, toggle, clear } = useWishlist()
  const addItem = useCart(s => s.addItem)

  const items = ids.map(id => SAMPLES[id] || {
    id,
    name: 'Vault Exclusive Product',
    price: 350,
    image: '/assets/dresses.jpg',
    slug: 'evening-gown',
  })

  function handleMoveToCart(item: any) {
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      slug: item.slug,
    })
    toggle(item.id)
    toast.success(`Moved ${item.name} to shopping bag!`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs text-vault-muted hover:text-gold mb-2">
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
          <h1 className="font-heading text-3xl font-bold text-vault-text">My Wishlist ({ids.length})</h1>
        </div>

        {ids.length > 0 && (
          <button onClick={clear} className="text-xs text-red-400 hover:text-red-300">
            Clear Wishlist
          </button>
        )}
      </div>

      {ids.length === 0 ? (
        <div className="text-center py-20 bg-vault-card border border-vault-border rounded-2xl">
          <Heart size={56} className="text-vault-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-vault-text mb-2">Your Wishlist is Empty</h2>
          <p className="text-vault-muted text-sm mb-6">Save items you love by clicking the heart icon while shopping.</p>
          <Link href="/shop" className="btn-gold py-3 px-8 text-sm">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="card-vault p-3 flex flex-col justify-between">
              <div>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                  <button
                    onClick={() => toggle(item.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-vault-bg/80 text-red-500 flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="font-medium text-sm text-vault-text truncate">{item.name}</h3>
                <div className="text-gold font-bold text-sm mt-1">{formatPrice(item.price)}</div>
              </div>

              <button
                onClick={() => handleMoveToCart(item)}
                className="btn-gold w-full py-2.5 text-xs font-bold mt-4 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> Move to Bag
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
