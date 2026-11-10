import Link from 'next/link'

export default function PromoBanner() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 bg-gradient-to-r from-gold-dark to-gold rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <div className="text-vault-bg text-xs font-bold uppercase tracking-wider mb-1">Limited Offer</div>
          <h3 className="text-vault-bg font-heading text-2xl font-bold mb-2">Free Delivery</h3>
          <p className="text-vault-bg/80 text-sm mb-4">On orders over NLe 500 in Freetown</p>
          <Link href="/shop" className="bg-vault-bg text-gold px-5 py-2 rounded-full text-sm font-semibold hover:bg-vault-surface transition-colors">
            Shop Now
          </Link>
        </div>
        <div className="text-8xl opacity-20 absolute right-4 top-1/2 -translate-y-1/2">🛍️</div>
      </div>

      <div className="bg-vault-card border border-vault-border rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="text-gold text-xs font-bold uppercase tracking-wider mb-1">WhatsApp Order</div>
          <h3 className="font-heading text-xl font-bold text-vault-text mb-2">Order via WhatsApp</h3>
          <p className="text-vault-muted text-sm">Message us your order and we'll get it delivered!</p>
        </div>
        <a href="https://wa.me/23277416008?text=Hi! I'd like to place an order" target="_blank" rel="noopener noreferrer"
          className="mt-4 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors text-center block">
          💬 +232 77 416008
        </a>
      </div>
    </section>
  )
}

