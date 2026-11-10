'use client'
import { useState } from 'react'
import { Save, Store, Phone, MapPin, DollarSign, Shield, Check } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Humu Kabba Variety Vault')
  const [adminEmail, setAdminEmail] = useState('mickykargbo3040@gmail.com')
  const [phone, setPhone] = useState('+232 77 416008')
  const [waNumber, setWaNumber] = useState('23277416008')
  const [address, setAddress] = useState('4B Johnson Land, Aberdeen, Freetown, Sierra Leone (Back of the Field)')
  const [currency, setCurrency] = useState('NLe')
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('600')

  const [codEnabled, setCodEnabled] = useState(true)
  const [waOrderEnabled, setWaOrderEnabled] = useState(true)
  const [orangeMoneyEnabled, setOrangeMoneyEnabled] = useState(true)
  const [afrimoneyEnabled, setAfrimoneyEnabled] = useState(true)
  const [cardEnabled, setCardEnabled] = useState(true)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Boutique settings saved successfully!')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">Store Configuration</h1>
        <p className="text-xs text-vault-muted mt-1">Configure business profile, contact channels, delivery rules, and payment gateways.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-vault-card border border-vault-border rounded-2xl p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg text-vault-text flex items-center gap-2">
            <Store size={18} className="text-gold" /> Brand & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">Business Name</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="input-vault py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">Currency Code</label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="input-vault py-2 text-sm uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">Official Hotline (Display)</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input-vault py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">WhatsApp Number (Direct Link Format)</label>
              <input
                type="text"
                value={waNumber}
                onChange={e => setWaNumber(e.target.value)}
                className="input-vault py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-vault-text mb-1">Physical Boutique Location</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="input-vault py-2 text-sm"
            />
          </div>
        </div>

        {/* Payment Gateways Toggle */}
        <div className="bg-vault-card border border-vault-border rounded-2xl p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg text-vault-text flex items-center gap-2">
            <DollarSign size={18} className="text-gold" /> Payment Methods Available to Customers
          </h2>

          <div className="space-y-3">
            {[
              { label: 'WhatsApp Direct Order', state: waOrderEnabled, setter: setWaOrderEnabled, desc: 'Generates formatted order link to +232 77 416008' },
              { label: 'Cash on Delivery (COD)', state: codEnabled, setter: setCodEnabled, desc: 'Customer pays courier upon arrival' },
              { label: 'Orange Money (Sierra Leone)', state: orangeMoneyEnabled, setter: setOrangeMoneyEnabled, desc: 'Manual wallet transfer or merchant prompt' },
              { label: 'Afrimoney (Sierra Leone)', state: afrimoneyEnabled, setter: setAfrimoneyEnabled, desc: 'Africell mobile money' },
              { label: 'Debit & Credit Cards (Paystack)', state: cardEnabled, setter: setCardEnabled, desc: 'Online card payment gateway' },
            ].map(m => (
              <label key={m.label} className="flex items-center justify-between p-3 rounded-xl bg-vault-surface border border-vault-border cursor-pointer hover:border-gold/30 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-vault-text">{m.label}</div>
                  <div className="text-xs text-vault-muted">{m.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={m.state}
                  onChange={e => m.setter(e.target.checked)}
                  className="accent-gold w-5 h-5 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-gold py-3 px-8 text-sm font-bold flex items-center gap-2 cursor-pointer">
          <Save size={16} /> Save Settings
        </button>
      </form>
    </div>
  )
}
