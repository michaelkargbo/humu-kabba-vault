'use client'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, Grid, List, X, Search } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import { Product, Category } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

const SAMPLE_PRODUCTS: Product[] = [
  { id: 's1', name: 'Evening Gown Collection', slug: 'evening-gown', category_id: 'dresses', brand: 'Humu Kabba', price: 850, original_price: 1200, discount_percent: 29, sku: 'DR-001', stock_quantity: 5, status: 'active', featured: true, is_new: true, is_best_seller: true, images: ['/assets/dresses.jpg'], tags: ['gown', 'luxury'], description: 'Luxury evening gowns in breathtaking fabrics.', created_at: '', updated_at: '' },
  { id: 's2', name: 'Designer Handbag Set', slug: 'designer-handbag', category_id: 'bags', brand: 'Humu Kabba', price: 650, original_price: 900, discount_percent: 28, sku: 'BG-001', stock_quantity: 8, status: 'active', featured: true, is_new: false, is_best_seller: true, images: ['/assets/bags.jpg'], tags: ['bag', 'leather'], description: 'Premium designer-inspired handbags.', created_at: '', updated_at: '' },
  { id: 's3', name: 'Luxury Perfume Bundle', slug: 'luxury-perfume', category_id: 'beauty', brand: 'Humu Kabba', price: 420, original_price: 600, discount_percent: 30, sku: 'PF-001', stock_quantity: 12, status: 'active', featured: true, is_new: true, is_best_seller: false, images: ['/assets/beauty.jpg'], tags: ['perfume', 'fragrance'], description: 'Exquisite fragrance collection.', created_at: '', updated_at: '' },
  { id: 's4', name: 'Full Cosmetics Kit', slug: 'cosmetics-kit', category_id: 'beauty', brand: 'Humu Kabba', price: 380, original_price: 500, discount_percent: 24, sku: 'MK-001', stock_quantity: 6, status: 'active', featured: false, is_new: false, is_best_seller: true, images: ['/assets/beauty.jpg'], tags: ['cosmetics', 'makeup'], description: 'Complete makeup kit.', created_at: '', updated_at: '' },
  { id: 's5', name: 'Stiletto Heel Shoes', slug: 'stiletto-heels', category_id: 'shoes', brand: 'Humu Kabba', price: 490, original_price: 700, discount_percent: 30, sku: 'SH-001', stock_quantity: 10, status: 'active', featured: true, is_new: true, is_best_seller: false, images: ['/assets/shoes.jpg'], tags: ['shoes', 'heels'], description: 'Elegant high-heeled shoes.', created_at: '', updated_at: '' },
  { id: 's6', name: 'Crystal Shell Case', slug: 'crystal-phone-case', category_id: 'phone-cases', brand: 'Humu Kabba', price: 180, original_price: 250, discount_percent: 28, sku: 'CS-001', stock_quantity: 20, status: 'active', featured: false, is_new: true, is_best_seller: false, images: ['/assets/cases/crystal_shell.jpg'], tags: ['cases', 'phone'], description: 'Ultra-slim crystal-clear case.', created_at: '', updated_at: '' },
  { id: 's7', name: 'Casual Floral Dress', slug: 'casual-floral-dress', category_id: 'dresses', brand: 'Humu Kabba', price: 520, original_price: 700, discount_percent: 26, sku: 'DR-002', stock_quantity: 7, status: 'active', featured: true, is_new: false, is_best_seller: true, images: ['/assets/dresses.jpg'], tags: ['dress', 'floral'], description: 'Light and breezy floral dress.', created_at: '', updated_at: '' },
  { id: 's8', name: 'Gold Clutch Purse', slug: 'gold-clutch', category_id: 'bags', brand: 'Humu Kabba', price: 350, original_price: 500, discount_percent: 30, sku: 'BG-002', stock_quantity: 9, status: 'active', featured: false, is_new: false, is_best_seller: true, images: ['/assets/bags.jpg'], tags: ['bag', 'clutch'], description: 'Glamorous gold-toned clutch.', created_at: '', updated_at: '' },
  { id: 's9', name: 'Heart Shell Designer Case', slug: 'heart-shell-case', category_id: 'phone-cases', brand: 'Humu Kabba', price: 180, original_price: 240, discount_percent: 25, sku: 'CS-002', stock_quantity: 15, status: 'active', featured: false, is_new: true, is_best_seller: true, images: ['/assets/cases/heart_shell.jpg'], tags: ['cases', 'phone'], description: 'Heart pattern luxury phone case.', created_at: '', updated_at: '' },
]

const CATEGORIES = [
  { slug: 'all', name: 'All Categories' },
  { slug: 'dresses', name: 'Dresses' },
  { slug: 'bags', name: 'Bags & Clutches' },
  { slug: 'shoes', name: 'Shoes & Heels' },
  { slug: 'beauty', name: 'Beauty & Cosmetics' },
  { slug: 'phone-cases', name: 'Phone Cases' },
  { slug: 'accessories', name: 'Jewellery & Accessories' },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  const initialQuery = searchParams.get('q') || ''
  const initialSort = searchParams.get('sort') || 'featured'

  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS)
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory)
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery)
  const [sortBy, setSortBy] = useState<string>(initialSort)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 8

  // Sync state if URL query changes
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setSelectedCat(cat)
    const q = searchParams.get('q')
    if (q) setSearchQuery(q)
    const sort = searchParams.get('sort')
    if (sort) setSortBy(sort)
  }, [searchParams])

  // Try to load real products from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('products').select('*').eq('status', 'active')
        if (data && data.length > 0) {
          setProducts(data)
        }
      } catch (e) {
        console.warn('Using sample catalog:', e)
      }
    }
    loadData()
  }, [])

  // Filter & sort
  const filtered = useMemo(() => {
    return products.filter(p => {
      // Category
      if (selectedCat !== 'all') {
        const catMatch = p.category_id?.toLowerCase() === selectedCat.toLowerCase() ||
                         p.tags?.includes(selectedCat.toLowerCase()) ||
                         p.name.toLowerCase().includes(selectedCat.toLowerCase())
        if (!catMatch) return false
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match = p.name.toLowerCase().includes(q) ||
                      p.description?.toLowerCase().includes(q) ||
                      p.brand?.toLowerCase().includes(q)
        if (!match) return false
      }
      // Price
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false
      // In stock
      if (inStockOnly && p.stock_quantity <= 0) return false

      return true
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'newest') return (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0)
      if (sortBy === 'bestseller') return (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0)
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    })
  }, [products, selectedCat, searchQuery, sortBy, priceRange, inStockOnly])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-vault-text">
            {CATEGORIES.find(c => c.slug === selectedCat)?.name || 'Product Catalog'}
          </h1>
          <p className="text-vault-muted text-sm mt-1">Showing {filtered.length} products</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-muted" />
            <input
              type="text"
              placeholder="Search in products..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input-vault pl-9 py-2 text-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-vault py-2 px-3 text-sm bg-vault-card cursor-pointer w-auto"
          >
            <option value="featured">Featured</option>
            <option value="newest">New Arrivals</option>
            <option value="bestseller">Best Sellers</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <div className="hidden sm:flex items-center border border-vault-border rounded-xl p-1 bg-vault-card">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg ${view === 'grid' ? 'bg-gold text-vault-bg' : 'text-vault-muted hover:text-vault-text'}`}
              aria-label="Grid view"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg ${view === 'list' ? 'bg-gold text-vault-bg' : 'text-vault-muted hover:text-vault-text'}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden btn-outline-gold py-2 px-3 text-sm flex items-center gap-2"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-vault-card border border-vault-border rounded-2xl p-5 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-heading font-semibold text-vault-text mb-3">Categories</h3>
              <div className="space-y-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => { setSelectedCat(cat.slug); setCurrentPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                      selectedCat === cat.slug
                        ? 'bg-gold/10 text-gold font-semibold'
                        : 'text-vault-muted hover:text-vault-text hover:bg-vault-surface'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-vault-border pt-4">
              <h3 className="font-heading font-semibold text-vault-text mb-3">Max Price: NLe {priceRange[1]}</h3>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-gold cursor-pointer"
              />
              <div className="flex justify-between text-xs text-vault-muted mt-1">
                <span>NLe 100</span>
                <span>NLe 2000+</span>
              </div>
            </div>

            {/* Availability */}
            <div className="border-t border-vault-border pt-4">
              <label className="flex items-center gap-3 cursor-pointer text-sm text-vault-muted hover:text-vault-text">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="rounded border-vault-border accent-gold w-4 h-4 cursor-pointer"
                />
                In Stock Only
              </label>
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setSelectedCat('all')
                setSearchQuery('')
                setPriceRange([0, 2000])
                setInStockOnly(false)
                setSortBy('featured')
                setCurrentPage(1)
              }}
              className="w-full text-xs text-vault-muted hover:text-gold text-center pt-2 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </aside>

        {/* Product Grid / List */}
        <div className="lg:col-span-3 space-y-8">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-20 bg-vault-card border border-vault-border rounded-2xl">
              <p className="text-vault-muted text-lg mb-4">No products found matching your filters.</p>
              <button
                onClick={() => { setSelectedCat('all'); setSearchQuery(''); setPriceRange([0, 2000]); setInStockOnly(false); }}
                className="btn-gold text-sm py-2 px-6"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' : 'space-y-4'}>
              {paginatedProducts.map(p => (
                <ProductCard key={p.id} product={p} view={view} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-ghost text-sm px-3 py-1.5 disabled:opacity-30"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                    currentPage === n
                      ? 'bg-gold text-vault-bg'
                      : 'bg-vault-card border border-vault-border text-vault-muted hover:text-vault-text'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-ghost text-sm px-3 py-1.5 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-vault-card border-l border-vault-border p-6 flex flex-col justify-between">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-vault-border">
                <span className="font-heading text-lg font-semibold text-vault-text">Filter Products</span>
                <button onClick={() => setMobileFilterOpen(false)} className="text-vault-muted hover:text-gold">
                  <X size={20} />
                </button>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-vault-text mb-2">Categories</h4>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => { setSelectedCat(cat.slug); setMobileFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                        selectedCat === cat.slug ? 'bg-gold text-vault-bg font-bold' : 'text-vault-muted'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-vault-text mb-2">Max Price: NLe {priceRange[1]}</h4>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-gold cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer text-sm text-vault-muted">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    className="accent-gold w-4 h-4 cursor-pointer"
                  />
                  In Stock Only
                </label>
              </div>
            </div>

            <button onClick={() => setMobileFilterOpen(false)} className="btn-gold w-full py-3 mt-6">
              Apply Filters ({filtered.length})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-vault-muted">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  )
}
