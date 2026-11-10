'use client'
import { useState } from 'react'
import { Truck, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState([
    { id: '1', name: 'Freetown Central / Aberdeen / Lumley / Wilberforce', fee: 30, freeAbove: 600, est: 'Same day (2-4 hrs)' },
    { id: '2', name: 'Freetown East / Kissy / Wellington', fee: 45, freeAbove: 700, est: 'Same day' },
    { id: '3', name: 'Waterloo & Peninsula', fee: 70, freeAbove: 1000, est: 'Next day' },
    { id: '4', name: 'Bo / Makeni / Kenema / Port Loko', fee: 120, freeAbove: 1500, est: '1-2 business days' },
    { id: '5', name: 'Other Towns & Districts in Sierra Leone', fee: 150, freeAbove: 2000, est: '2-3 business days' },
  ])

  function handleUpdateFee(id: string, newFee: number) {
    setZones(prev => prev.map(z => z.id === id ? { ...z, fee: newFee } : z))
    toast.success('Delivery fee updated!')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">Delivery & Logistics Zones</h1>
        <p className="text-xs text-vault-muted mt-1">Configure courier fees, free shipping thresholds, and estimated arrival times for Sierra Leone.</p>
      </div>

      <div className="space-y-4">
        {zones.map(z => (
          <div key={z.id} className="bg-vault-card border border-vault-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-vault-text text-sm">{z.name}</h3>
              <p className="text-xs text-vault-muted mt-0.5">Est. Delivery: {z.est} • Free above {formatPrice(z.freeAbove)}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-vault-muted">
                <span>Fee (NLe):</span>
                <input
                  type="number"
                  value={z.fee}
                  onChange={e => handleUpdateFee(z.id, Number(e.target.value))}
                  className="input-vault w-24 py-1.5 px-2 text-sm text-center font-bold text-gold"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
