'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, MapPin, Phone, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-vault-surface border-t border-vault-border mt-20 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold/40">
                <Image src="/assets/logo.jpg" alt="Humu Kabba Variety Vault" width={48} height={48} className="object-cover" />
              </div>
              <div>
                <div className="font-heading text-gold font-semibold">Humu Kabba</div>
                <div className="text-xs text-vault-muted">Variety Vault</div>
              </div>
            </div>
            <p className="text-vault-muted text-sm leading-relaxed mb-4">
              Your Style, Our Priority. Quality fashion, beauty & lifestyle products delivered across Sierra Leone.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://wa.me/23277416008" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-500 transition-colors" aria-label="WhatsApp">
                <MessageCircle size={16} />
              </a>
              <a href="https://wa.me/23277416008" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors font-bold text-xs" aria-label="Facebook">
                f
              </a>
              <a href="https://wa.me/23277416008" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-500 transition-colors font-bold text-xs" aria-label="Instagram">
                ig
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-vault-text font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Shop All', href: '/shop' },
                { label: 'New Arrivals', href: '/shop?sort=newest' },
                { label: 'Best Sellers', href: '/shop?sort=bestseller' },
                { label: 'Track My Order', href: '/orders/track' },
                { label: 'My Account', href: '/account' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm text-vault-muted hover:text-gold transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-heading text-vault-text font-semibold mb-4">Help & Info</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Boutique', href: '/shop' },
                { label: 'Track Order', href: '/orders/track' },
                { label: 'Customer Wishlist', href: '/wishlist' },
                { label: 'Store Admin', href: '/admin' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm text-vault-muted hover:text-gold transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-vault-text font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-vault-muted">4B Johnson Land, Aberdeen, Freetown, Sierra Leone</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gold flex-shrink-0" />
                <a href="tel:+23277416008" className="text-sm text-vault-muted hover:text-gold transition-colors">+232 77 416008</a>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-gold mt-0.5 flex-shrink-0" />
                <div className="text-sm text-vault-muted">
                  <div>Mon–Sat: 09:00 – 19:00</div>
                  <div>Sunday: 13:00 – 17:00</div>
                </div>
              </div>
              <a href="https://wa.me/23277416008" target="_blank" rel="noopener noreferrer" className="btn-gold inline-block text-sm mt-2 py-2 px-5">
                💬 WhatsApp Order
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-vault-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-vault-muted">© 2026 Humu Kabba Variety Vault. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-vault-muted">
            <span>Payments:</span>
            <span className="bg-vault-card border border-vault-border px-2 py-1 rounded">Orange Money</span>
            <span className="bg-vault-card border border-vault-border px-2 py-1 rounded">Afrimoney</span>
            <span className="bg-vault-card border border-vault-border px-2 py-1 rounded">Card</span>
            <span className="bg-vault-card border border-vault-border px-2 py-1 rounded">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
