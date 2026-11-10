'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types/database'
import { formatPrice } from '@/lib/utils'

interface SearchModalProps { open: boolean; onClose: () => void }

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${q}%`)
      .eq('status', 'active')
      .limit(8)
    setResults(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  useEffect(() => {
    if (open) { setQuery(''); setResults([]) }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 left-0 right-0 bg-vault-card border-b border-vault-border p-4 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vault-muted" size={18} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, categories..."
              className="input-vault pl-11 pr-10"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-vault-muted hover:text-gold">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results */}
          {query && (
            <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
              {loading && <p className="text-vault-muted text-sm text-center py-4">Searching...</p>}
              {!loading && results.length === 0 && query && (
                <p className="text-vault-muted text-sm text-center py-4">No results for "{query}"</p>
              )}
              {results.map(p => {
                const img = Array.isArray(p.images) ? (p.images as string[])[0] : '/placeholder.jpg'
                return (
                  <Link key={p.id} href={`/product/${p.slug}`} onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-vault-surface transition-colors">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={img} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-vault-text truncate">{p.name}</p>
                      <p className="text-gold text-sm font-bold">{formatPrice(p.price)}</p>
                    </div>
                    <ArrowRight size={14} className="text-vault-muted" />
                  </Link>
                )
              })}
              {results.length > 0 && (
                <Link href={`/shop?q=${encodeURIComponent(query)}`} onClick={onClose}
                  className="flex items-center justify-center gap-2 py-3 text-sm text-gold hover:text-gold-light transition-colors">
                  View all results for "{query}" <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

