'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck, CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, generateOrderRef, buildWhatsAppLink, WA_NUMBER, buildOrderWhatsAppMessage } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/Toast'

const DELIVERY_ZONES = [
  { id: 'ft-central', name: 'Freetown Central / Aberdeen / Lumley / Wilberforce', fee: 30, freeAbove: 600, est: 'Same day (2-4 hrs)' },
  { id: 'ft-east', name: 'Freetown East / Kissy / Wellington', fee: 45, freeAbove: 700, est: 'Same day' },
  { id: 'waterloo', name: 'Waterloo & Peninsula', fee: 70, freeAbove: 1000, est: 'Next day' },
  { id: 'provinces-bo-makeni', name: 'Bo / Makeni / Kenema / Port Loko', fee: 120, freeAbove: 1500, est: '1-2 business days' },
  { id: 'other-districts', name: 'Other Towns & Districts in Sierra Leone', fee: 150, freeAbove: 2000, est: '2-3 business days' },
]

export default function CartAndCheckoutPage() {
  const { items, updateQty, removeItem, clearCart, getSubtotal } = useCart()

  // Form states
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [instructions, setInstructions] = useState('')
  const [selectedZone, setSelectedZone] = useState(DELIVERY_ZONES[0])
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'cod' | 'orange_money' | 'afrimoney' | 'card'>('whatsapp')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null)

  const subtotal = getSubtotal()
  const deliveryFee = subtotal >= (selectedZone.freeAbove || Infinity) ? 0 : selectedZone.fee
  const finalTotal = Math.max(0, subtotal + deliveryFee - discount)

  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (couponCode.toUpperCase() === 'VAULT10') {
      const d = Math.round(subtotal * 0.10)
      setDiscount(d)
      toast.success('Coupon VAULT10 applied! 10% discount')
    } else {
      toast.error('Invalid coupon code')
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Your shopping bag is empty')
      return
    }
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.error('Please fill in your name, phone number and delivery address')
      return
    }

    setSubmitting(true)
    const orderRef = generateOrderRef()

    const orderPayload = {
      order_reference: orderRef,
      customer_name: fullName.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || null,
      delivery_address: `${address.trim()} (${selectedZone.name})`,
      delivery_fee: deliveryFee,
      delivery_instructions: instructions.trim() || null,
      items: items.map(i => ({
        id: i.productId,
        name: i.name,
        price: i.price,
        qty: i.quantity,
        variation: i.variationLabel || null,
        image: i.image,
      })),
      subtotal,
      discount_amount: discount,
      total: finalTotal,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'card' ? 'pending' : 'pending',
      status: 'pending',
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('orders').insert([orderPayload])
      if (error) {
        console.warn('Database insert failed, proceeding with client confirmation:', error)
      }

      setConfirmedOrder({
        reference: orderRef,
        customerName: fullName,
        phone,
        address: `${address} (${selectedZone.name})`,
        items,
        total: finalTotal,
        paymentMethod,
      })

      clearCart()
      toast.success('Order placed successfully! 🎉')
    } catch (err) {
      console.error('Order error:', err)
      toast.error('Could not submit order. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------- ORDER CONFIRMATION VIEW ----------------
  if (confirmedOrder) {
    const waText = buildOrderWhatsAppMessage({
      reference: confirmedOrder.reference,
      customerName: confirmedOrder.customerName,
      items: confirmedOrder.items.map((i: any) => ({ name: `${i.name}${i.variationLabel ? ` (${i.variationLabel})` : ''}`, qty: i.quantity, price: i.price })),
      total: confirmedOrder.total,
      deliveryAddress: confirmedOrder.address,
      paymentMethod: confirmedOrder.paymentMethod.toUpperCase(),
    })
    const waUrl = buildWhatsAppLink(WA_NUMBER, waText)

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-vault-text mb-2">Order Confirmed!</h1>
        <p className="text-vault-muted mb-6">Thank you, <span className="text-gold font-semibold">{confirmedOrder.customerName}</span>. Your order is registered.</p>

        <div className="bg-vault-card border border-vault-border rounded-2xl p-6 text-left space-y-4 mb-8">
          <div className="flex justify-between items-center pb-4 border-b border-vault-border">
            <div>
              <div className="text-xs text-vault-muted">Order Reference</div>
              <div className="font-mono font-bold text-gold text-lg">{confirmedOrder.reference}</div>
            </div>
            <span className="badge-gold">STATUS: PENDING</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-vault-muted tracking-wider">Ordered Products:</h4>
            {confirmedOrder.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-vault-surface flex-shrink-0">
                  <Image src={item.image || '/assets/dresses.jpg'} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-vault-text truncate">{item.name}</p>
                  <p className="text-xs text-vault-muted">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <span className="text-sm font-bold text-gold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-vault-border flex justify-between items-center">
            <span className="font-semibold text-vault-text">Total Payable:</span>
            <span className="font-heading text-2xl font-bold text-gold">{formatPrice(confirmedOrder.total)}</span>
          </div>
        </div>

        {/* Action Button: WhatsApp confirmation */}
        <div className="space-y-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg transition-colors shadow-xl"
          >
            <MessageCircle size={24} /> Confirm & Dispatch via WhatsApp
          </a>

          <Link href="/shop" className="btn-outline-gold inline-block text-sm py-2 px-6">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  // ---------------- CART & CHECKOUT FORM ----------------
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-vault-text mb-8">Shopping Bag & Checkout</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-vault-card border border-vault-border rounded-2xl">
          <ShoppingBag size={56} className="text-vault-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-vault-text mb-2">Your Bag is Empty</h2>
          <p className="text-vault-muted mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/shop" className="btn-gold py-3 px-8 text-sm">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Cart Items (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-vault-card border border-vault-border rounded-2xl p-6 space-y-4">
              <h2 className="font-heading font-semibold text-lg text-vault-text flex items-center justify-between">
                <span>Items in Bag ({items.length})</span>
                <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
              </h2>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={`${item.productId}-${item.variationId}`} className="flex gap-4 p-3 rounded-xl bg-vault-surface border border-vault-border">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image || '/assets/dresses.jpg'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-vault-text truncate">{item.name}</h4>
                      {item.variationLabel && (
                        <p className="text-xs text-vault-muted mt-0.5">{item.variationLabel}</p>
                      )}
                      <div className="text-gold font-bold text-sm mt-1">{formatPrice(item.price)}</div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-vault-border rounded-lg bg-vault-card">
                          <button
                            onClick={() => updateQty(item.productId, item.quantity - 1, item.variationId)}
                            className="p-1 text-vault-muted hover:text-gold"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-vault-text">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.quantity + 1, item.variationId)}
                            className="p-1 text-vault-muted hover:text-gold"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.variationId)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon code */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Promo Code (try VAULT10)"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="input-vault py-2 px-3 text-sm uppercase flex-1"
                />
                <button type="submit" className="btn-outline-gold py-2 px-4 text-xs font-bold whitespace-nowrap">
                  Apply
                </button>
              </form>

              {/* Price Calculation Summary */}
              <div className="border-t border-vault-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-vault-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-vault-text">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount (VAULT10)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-vault-muted">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-vault-text">
                    {deliveryFee === 0 ? <span className="text-green-400">FREE</span> : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="border-t border-vault-border pt-2 flex justify-between items-center text-base font-bold">
                  <span className="text-vault-text">Total</span>
                  <span className="text-gold font-heading text-xl">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form (7 cols) */}
          <div className="lg:col-span-7">
            <form onSubmit={handlePlaceOrder} className="bg-vault-card border border-vault-border rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="font-heading font-semibold text-xl text-vault-text mb-1">Customer & Delivery Details</h2>
                <p className="text-xs text-vault-muted">Please provide exact delivery information for Sierra Leone courier.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-vault-text mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mariama Sesay"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="input-vault py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-vault-text mb-1.5">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +232 77 416008"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-vault py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-vault-text mb-1.5">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="order-receipt@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-vault py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-vault-text mb-1.5">Select Delivery Zone *</label>
                <select
                  value={selectedZone.id}
                  onChange={e => {
                    const z = DELIVERY_ZONES.find(x => x.id === e.target.value)
                    if (z) setSelectedZone(z)
                  }}
                  className="input-vault py-2.5 text-sm bg-vault-surface cursor-pointer"
                >
                  {DELIVERY_ZONES.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.name} — NLe {z.fee} ({z.est})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-vault-text mb-1.5">Exact Delivery Address & Landmark *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. 4B Johnson Land, Back of the Field, Aberdeen, Freetown"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="input-vault py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-vault-text mb-1.5">Special Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Please call before reaching Aberdeen junction"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="input-vault py-2.5 text-sm"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-medium text-vault-text mb-2">Choose Payment Method *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp Order', desc: 'Confirm & pay on WA' },
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when rider arrives' },
                    { id: 'orange_money', label: 'Orange Money', desc: 'Mobile wallet (SL)' },
                    { id: 'afrimoney', label: 'Afrimoney', desc: 'Africell money (SL)' },
                    { id: 'card', label: 'Debit / Credit Card', desc: 'Visa & Mastercard' },
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === method.id
                          ? 'border-gold bg-gold/10'
                          : 'border-vault-border bg-vault-surface hover:border-vault-muted'
                      }`}
                    >
                      <div className="text-xs font-bold text-vault-text">{method.label}</div>
                      <div className="text-[10px] text-vault-muted mt-0.5">{method.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full py-4 text-base font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Processing Order...' : `Place Order • ${formatPrice(finalTotal)}`}
                {!submitting && <ArrowRight size={18} />}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-vault-muted text-center pt-2">
                <ShieldCheck size={14} className="text-gold" />
                Guaranteed safe & secure ordering via Humu Kabba Variety Vault
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
