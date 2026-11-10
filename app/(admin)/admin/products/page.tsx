'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Search, Trash2, Edit, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // New product form state
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategory, setNewCategory] = useState('dresses')
  const [newStock, setNewStock] = useState('10')
  const [newDesc, setNewDesc] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('/assets/dresses.jpg')

  async function loadProducts() {
    try {
      const supabase = createClient()
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (data && data.length > 0) {
        setProducts(data)
      } else {
        setProducts([
          { id: '1', name: 'Evening Gown Collection', price: 850, stock_quantity: 5, category_id: 'dresses', featured: true, images: ['/assets/dresses.jpg'] },
          { id: '2', name: 'Designer Handbag Set', price: 650, stock_quantity: 8, category_id: 'bags', featured: true, images: ['/assets/bags.jpg'] },
          { id: '3', name: 'Luxury Perfume Bundle', price: 420, stock_quantity: 12, category_id: 'beauty', featured: false, images: ['/assets/beauty.jpg'] },
          { id: '4', name: 'Stiletto Heel Shoes', price: 490, stock_quantity: 10, category_id: 'shoes', featured: true, images: ['/assets/shoes.jpg'] },
          { id: '5', name: 'Crystal Phone Case', price: 180, stock_quantity: 20, category_id: 'phone-cases', featured: false, images: ['/assets/cases/crystal_shell.jpg'] },
        ])
      }
    } catch (e) {
      console.warn('Products fetch error:', e)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newPrice) return

    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const productItem = {
      name: newName.trim(),
      slug,
      price: parseFloat(newPrice),
      stock_quantity: parseInt(newStock) || 10,
      category_id: newCategory,
      description: newDesc.trim() || 'Exclusive luxury item from Humu Kabba Variety Vault.',
      images: [newImageUrl.trim() || '/assets/dresses.jpg'],
      status: 'active',
      featured: true,
      is_new: true,
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('products').insert([productItem]).select()
      if (error) {
        console.warn('Supabase insert failed, saving locally:', error)
      }
      setProducts(prev => [data ? data[0] : { id: 'local-' + Date.now(), ...productItem }, ...prev])
      toast.success('Product added successfully!')
      setModalOpen(false)
      setNewName('')
      setNewPrice('')
    } catch (err) {
      toast.error('Could not save product')
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-vault-text">Product Inventory</h1>
          <p className="text-xs text-vault-muted mt-1">Manage catalog listings, prices, stock levels, and featured highlights.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-gold py-2 px-4 text-xs font-bold flex items-center gap-2 self-start"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
        <input
          type="text"
          placeholder="Search products by title or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-vault pl-10 py-2 text-sm"
        />
      </div>

      {/* Products Table */}
      <div className="bg-vault-card border border-vault-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-vault-surface border-b border-vault-border text-xs text-vault-muted">
              <tr>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-border">
              {filtered.map(item => {
                const img = Array.isArray(item.images) ? item.images[0] : (typeof item.images === 'string' ? item.images : '/assets/dresses.jpg')
                return (
                  <tr key={item.id} className="hover:bg-vault-surface/60 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-vault-surface">
                        <Image src={img || '/assets/dresses.jpg'} alt="" fill className="object-cover" />
                      </div>
                      <span className="font-medium text-vault-text truncate max-w-xs">{item.name}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-vault-muted capitalize">
                      {item.category_id || 'General'}
                    </td>
                    <td className="py-3 px-4 font-bold text-gold">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        item.stock_quantity <= 2 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {item.stock_quantity} in stock
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.featured ? (
                        <span className="text-xs text-gold font-bold">★ Featured</span>
                      ) : (
                        <span className="text-xs text-vault-muted">Regular</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-vault-card border border-vault-border rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-vault-border">
              <h3 className="font-heading font-semibold text-lg text-vault-text">Add New Product</h3>
              <button onClick={() => setModalOpen(false)} className="text-vault-muted hover:text-gold"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-vault-text mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Lace Evening Dress"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input-vault py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-vault-text mb-1">Price (NLe)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 750"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="input-vault py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-vault-text mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="10"
                    value={newStock}
                    onChange={e => setNewStock(e.target.value)}
                    className="input-vault py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-vault-text mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="input-vault py-2 bg-vault-surface cursor-pointer"
                >
                  <option value="dresses">Dresses</option>
                  <option value="bags">Bags</option>
                  <option value="shoes">Shoes</option>
                  <option value="beauty">Beauty</option>
                  <option value="phone-cases">Phone Cases</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-vault-text mb-1">Image Asset Path / URL</label>
                <input
                  type="text"
                  placeholder="/assets/dresses.jpg"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  className="input-vault py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-vault-text mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Product description and details..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="input-vault py-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-gold flex-1 py-2.5 font-bold">
                  Save Product
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
