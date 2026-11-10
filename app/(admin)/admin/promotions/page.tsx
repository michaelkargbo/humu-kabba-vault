'use client'
import { useState } from 'react'
import { Tag, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'VAULT10', discount: '10% OFF', minOrder: 300, uses: 42, active: true },
    { id: '2', code: 'WELCOME50', discount: 'NLe 50 OFF', minOrder: 500, uses: 19, active: true },
    { id: '3', code: 'FREESHIP', discount: 'Free Shipping', minOrder: 400, uses: 31, active: false },
  ])

  const [newCode, setNewCode] = useState('')
  const [newDiscount, setNewDiscount] = useState('15%')

  function handleAddCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (!newCode.trim()) return
    setCoupons(prev => [
      { id: Date.now().toString(), code: newCode.toUpperCase().trim(), discount: newDiscount, minOrder: 200, uses: 0, active: true },
      ...prev
    ])
    setNewCode('')
    toast.success('Coupon code created!')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">Coupons & Campaigns</h1>
        <p className="text-xs text-vault-muted mt-1">Create promotional discount codes and flash sale offers.</p>
      </div>

      {/* Add coupon */}
      <form onSubmit={handleAddCoupon} className="bg-vault-card border border-vault-border rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-vault-text mb-1">Coupon Code</label>
          <input
            type="text"
            required
            placeholder="e.g. VIP20"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            className="input-vault py-2 uppercase text-sm"
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-medium text-vault-text mb-1">Discount Value</label>
          <input
            type="text"
            required
            placeholder="e.g. 15% or NLe 50"
            value={newDiscount}
            onChange={e => setNewDiscount(e.target.value)}
            className="input-vault py-2 text-sm"
          />
        </div>
        <button type="submit" className="btn-gold py-2.5 px-6 text-xs font-bold whitespace-nowrap self-stretch sm:self-auto">
          Create Code
        </button>
      </form>

      {/* List */}
      <div className="space-y-3">
        {coupons.map(c => (
          <div key={c.id} className="bg-vault-card border border-vault-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-bold">
                <Tag size={18} />
              </div>
              <div>
                <span className="font-mono font-bold text-gold text-base">{c.code}</span>
                <p className="text-xs text-vault-muted">{c.discount} • Min. Order NLe {c.minOrder} • Used {c.uses} times</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
              c.active ? 'bg-green-500/20 text-green-400' : 'bg-vault-surface text-vault-muted'
            }`}>
              {c.active ? 'Active' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
