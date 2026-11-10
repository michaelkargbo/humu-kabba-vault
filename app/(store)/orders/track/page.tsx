'use client'
import { useState } from 'react'
import { Search, PackageCheck, Truck, Clock, CheckCircle2, AlertCircle, Phone, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'

export default function OrderTrackingPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[] | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const supabase = createClient()
      const cleanQ = query.trim()
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`order_reference.eq.${cleanQ},customer_phone.ilike.%${cleanQ}%`)
        .order('created_at', { ascending: false })

      setOrders(data || [])
    } catch (err) {
      console.error('Tracking query error:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const STAGES = [
    { key: 'pending', label: 'Order Placed', desc: 'Received in system' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Verified by boutique' },
    { key: 'processing', label: 'Processing', desc: 'Packed & inspected' },
    { key: 'shipped', label: 'Out for Delivery', desc: 'With courier rider' },
    { key: 'delivered', label: 'Delivered', desc: 'Successfully handed over' },
  ]

  function getActiveStepIndex(status: string) {
    const s = (status || 'pending').toLowerCase()
    if (s === 'delivered') return 4
    if (s === 'shipped' || s === 'ready') return 3
    if (s === 'processing' || s === 'preparing') return 2
    if (s === 'confirmed') return 1
    return 0
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-vault-muted hover:text-gold mb-6">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-vault-text mb-2">Track Your Order</h1>
        <p className="text-vault-muted text-sm">
          Enter your Order Reference (e.g. HKV-...) or the Phone Number you used at checkout.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mt-6">
          <input
            type="text"
            required
            placeholder="e.g. HKV-1234-ABCD or +23277416008"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-vault py-3 px-4 text-sm flex-1 font-mono uppercase placeholder:normal-case placeholder:font-sans"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-gold py-3 px-6 text-sm font-bold flex items-center gap-2"
          >
            <Search size={16} /> {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-6">
          {orders && orders.length > 0 ? (
            orders.map(order => {
              const currentStep = getActiveStepIndex(order.status)
              return (
                <div key={order.id || order.order_reference} className="bg-vault-card border border-vault-border rounded-2xl p-6 md:p-8 space-y-6">
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-vault-border">
                    <div>
                      <div className="text-xs text-vault-muted uppercase tracking-wider">Order Reference</div>
                      <div className="font-mono text-xl font-bold text-gold">{order.order_reference}</div>
                      <div className="text-xs text-vault-muted mt-1">Placed on {formatDate(order.created_at || new Date().toISOString())}</div>
                    </div>
                    <div className="sm:text-right">
                      <span className="badge-gold uppercase font-bold text-xs px-3 py-1">
                        {order.status || 'PENDING'}
                      </span>
                      <div className="text-vault-text font-bold text-lg mt-1">{formatPrice(order.total || 0)}</div>
                    </div>
                  </div>

                  {/* Progress tracker timeline */}
                  <div className="py-4">
                    <div className="grid grid-cols-5 gap-2 text-center relative">
                      {STAGES.map((stg, idx) => {
                        const isDone = idx <= currentStep
                        return (
                          <div key={stg.key} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                              isDone ? 'bg-gold text-vault-bg shadow-md' : 'bg-vault-surface text-vault-muted border border-vault-border'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className={`text-xs font-semibold ${isDone ? 'text-vault-text' : 'text-vault-muted'}`}>
                              {stg.label}
                            </span>
                            <span className="text-[10px] text-vault-muted hidden sm:block mt-0.5">{stg.desc}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Delivery details & Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-vault-border text-sm">
                    <div>
                      <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2">Delivery Information</h4>
                      <p className="text-vault-text font-medium">{order.customer_name}</p>
                      <p className="text-vault-muted">{order.customer_phone}</p>
                      <p className="text-vault-muted mt-1">{order.delivery_address}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2">Payment Details</h4>
                      <p className="text-vault-text font-medium">Method: <span className="uppercase">{order.payment_method}</span></p>
                      <p className="text-vault-muted">Payment Status: <span className="text-gold font-semibold uppercase">{order.payment_status}</span></p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-16 bg-vault-card border border-vault-border rounded-2xl p-6">
              <AlertCircle size={48} className="text-vault-muted mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-vault-text">No Orders Found</h3>
              <p className="text-vault-muted text-sm mt-1 max-w-md mx-auto">
                We couldn't find any orders matching "{query}". Please double-check your order reference or contact us directly on WhatsApp.
              </p>
              <a
                href="https://wa.me/23277416008"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2 text-sm mt-6 py-2 px-6"
              >
                <Phone size={14} /> Help via WhatsApp (+232 77 416008)
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
