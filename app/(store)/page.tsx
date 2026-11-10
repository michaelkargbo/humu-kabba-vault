import { createClient } from '@/lib/supabase/server'
import HeroSlider from '@/components/home/HeroSlider'
import CategoryGrid from '@/components/home/CategoryGrid'
import ProductSection from '@/components/home/ProductSection'
import PromoBanner from '@/components/home/PromoBanner'
import WhatsAppFloat from '@/components/ui/WhatsAppFloat'

export const revalidate = 60 // ISR: refresh every 60 seconds

export default async function HomePage() {
  const supabase = await createClient()

  const [bannersRes, featuredRes, newRes, bestRes, catsRes] = await Promise.all([
    supabase.from('banners').select('*').eq('active', true).order('sort_order').limit(6),
    supabase.from('products').select('*').eq('status', 'active').eq('featured', true).order('created_at', { ascending: false }).limit(8),
    supabase.from('products').select('*').eq('status', 'active').eq('is_new', true).order('created_at', { ascending: false }).limit(8),
    supabase.from('products').select('*').eq('status', 'active').eq('is_best_seller', true).limit(8),
    supabase.from('categories').select('*').eq('active', true).order('sort_order').limit(12),
  ])

  const banners = bannersRes.data || []
  const featured = featuredRes.data || []
  const newArrivals = newRes.data || []
  const bestSellers = bestRes.data || []
  const categories = catsRes.data || []

  // If Supabase empty, use sample data
  const sampleProducts = getSampleProducts()
  const displayFeatured = featured.length > 0 ? featured : sampleProducts
  const displayNew = newArrivals.length > 0 ? newArrivals : sampleProducts.slice(0, 8)
  const displayBest = bestSellers.length > 0 ? bestSellers : sampleProducts.slice(0, 8)

  return (
    <div>
      <HeroSlider banners={banners} />
      <CategoryGrid categories={categories} />

      <div className="max-w-7xl mx-auto px-4 space-y-16 pb-16">
        <PromoBanner />

        <ProductSection
          title="🔥 Trending Now"
          subtitle="Most loved items this week"
          products={displayFeatured}
          viewAllHref="/shop?sort=featured"
        />

        <ProductSection
          title="✨ New Arrivals"
          subtitle="Fresh styles just landed"
          products={displayNew}
          viewAllHref="/shop?sort=newest"
        />

        <ProductSection
          title="⭐ Best Sellers"
          subtitle="Customer favourites"
          products={displayBest}
          viewAllHref="/shop?sort=bestseller"
        />
      </div>

      <WhatsAppFloat />
    </div>
  )
}

function getSampleProducts() {
  return [
    { id: 's1', name: 'Evening Gown Collection', slug: 'evening-gown', category_id: null, brand: 'Humu Kabba', price: 850, original_price: 1200, discount_percent: 29, sku: null, stock_quantity: 5, status: 'active' as const, featured: true, is_new: true, is_best_seller: true, images: ['/assets/dresses.jpg'], tags: [], description: 'Luxury evening gowns', created_at: '', updated_at: '' },
    { id: 's2', name: 'Designer Handbag Set', slug: 'designer-handbag', category_id: null, brand: 'Humu Kabba', price: 650, original_price: 900, discount_percent: 28, sku: null, stock_quantity: 8, status: 'active' as const, featured: true, is_new: false, is_best_seller: true, images: ['/assets/bags.jpg'], tags: [], description: 'Premium designer-inspired handbags', created_at: '', updated_at: '' },
    { id: 's3', name: 'Luxury Perfume Bundle', slug: 'luxury-perfume', category_id: null, brand: 'Humu Kabba', price: 420, original_price: 600, discount_percent: 30, sku: null, stock_quantity: 12, status: 'active' as const, featured: true, is_new: true, is_best_seller: false, images: ['/assets/beauty.jpg'], tags: [], description: 'Exquisite fragrance collection', created_at: '', updated_at: '' },
    { id: 's4', name: 'Full Cosmetics Kit', slug: 'cosmetics-kit', category_id: null, brand: 'Humu Kabba', price: 380, original_price: 500, discount_percent: 24, sku: null, stock_quantity: 6, status: 'active' as const, featured: false, is_new: false, is_best_seller: true, images: ['/assets/beauty.jpg'], tags: [], description: 'Complete makeup kit', created_at: '', updated_at: '' },
    { id: 's5', name: 'Stiletto Heel Shoes', slug: 'stiletto-heels', category_id: null, brand: 'Humu Kabba', price: 490, original_price: 700, discount_percent: 30, sku: null, stock_quantity: 10, status: 'active' as const, featured: true, is_new: true, is_best_seller: false, images: ['/assets/shoes.jpg'], tags: [], description: 'Elegant high-heeled shoes', created_at: '', updated_at: '' },
    { id: 's6', name: 'Crystal Phone Case', slug: 'crystal-phone-case', category_id: null, brand: 'Humu Kabba', price: 180, original_price: 250, discount_percent: 28, sku: null, stock_quantity: 20, status: 'active' as const, featured: false, is_new: true, is_best_seller: false, images: ['/assets/cases/crystal_shell.jpg'], tags: [], description: 'Ultra-slim crystal-clear case', created_at: '', updated_at: '' },
    { id: 's7', name: 'Casual Floral Dress', slug: 'casual-floral-dress', category_id: null, brand: 'Humu Kabba', price: 520, original_price: 700, discount_percent: 26, sku: null, stock_quantity: 7, status: 'active' as const, featured: true, is_new: false, is_best_seller: true, images: ['/assets/dresses.jpg'], tags: [], description: 'Light and breezy floral dress', created_at: '', updated_at: '' },
    { id: 's8', name: 'Gold Clutch Purse', slug: 'gold-clutch', category_id: null, brand: 'Humu Kabba', price: 350, original_price: 500, discount_percent: 30, sku: null, stock_quantity: 9, status: 'active' as const, featured: false, is_new: false, is_best_seller: true, images: ['/assets/bags.jpg'], tags: [], description: 'Glamorous gold-toned clutch', created_at: '', updated_at: '' },
  ]
}

