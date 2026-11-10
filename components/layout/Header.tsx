'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ShoppingBag, Heart, Search, Menu, X, User, Bell } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { cn } from '@/lib/utils'
import SearchModal from './SearchModal'
import CartDrawer from '../cart/CartDrawer'

const NAV_LINKS = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Women', href: '/shop?category=women' },
  { label: 'Men', href: '/shop?category=men' },
  { label: 'Shoes', href: '/shop?category=shoes' },
  { label: 'Bags', href: '/shop?category=bags' },
  { label: 'Beauty', href: '/shop?category=beauty' },
  { label: 'Accessories', href: '/shop?category=accessories' },
  { label: 'Electronics', href: '/shop?category=electronics' },
  { label: 'Home', href: '/shop?category=home' },
]

export default function Header() {
  const cartCount = useCart(s => s.getCount())
  const wishCount = useWishlist(s => s.ids.length)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-vault-bg/95 backdrop-blur-md shadow-lg border-b border-vault-border' : 'bg-transparent'
      )}>
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenu(true)} className="lg:hidden text-vault-muted hover:text-gold transition-colors" aria-label="Menu">
                <Menu size={24} />
              </button>
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/40 group-hover:border-gold transition-colors">
                  <Image src="/assets/logo.jpg" alt="Humu Kabba Variety Vault" width={40} height={40} className="object-cover" priority />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-heading font-semibold text-gold leading-tight">Humu Kabba</div>
                  <div className="text-xs text-vault-muted leading-tight">Variety Vault</div>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.slice(0, 6).map(link => (
                <Link key={link.href} href={link.href} className="text-sm text-vault-muted hover:text-gold transition-colors font-medium">
                  {link.label}
                </Link>
              ))}
              <div className="relative group">
                <button className="text-sm text-vault-muted hover:text-gold transition-colors font-medium">More ▾</button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-vault-card border border-vault-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {NAV_LINKS.slice(6).map(link => (
                    <Link key={link.href} href={link.href} className="block px-4 py-3 text-sm text-vault-muted hover:text-gold hover:bg-vault-surface transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-vault-muted hover:text-gold transition-colors" aria-label="Search">
                <Search size={20} />
              </button>
              <Link href="/account/notifications" className="p-2 text-vault-muted hover:text-gold transition-colors hidden sm:block" aria-label="Notifications">
                <Bell size={20} />
              </Link>
              <Link href="/wishlist" className="p-2 text-vault-muted hover:text-gold transition-colors relative" aria-label="Wishlist">
                <Heart size={20} />
                {wishCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-vault-bg text-xs font-bold rounded-full flex items-center justify-center">
                    {wishCount > 9 ? '9+' : wishCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setCartOpen(true)} className="p-2 text-vault-muted hover:text-gold transition-colors relative" aria-label="Cart">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-vault-bg text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
              <Link href="/account" className="p-2 text-vault-muted hover:text-gold transition-colors hidden sm:block" aria-label="Account">
                <User size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Category bar (desktop) */}
        <div className="hidden lg:block border-t border-vault-border bg-vault-surface/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-6 h-10 overflow-x-auto scrollbar-hide">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className="text-xs text-vault-muted hover:text-gold whitespace-nowrap transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenu(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-vault-card border-r border-vault-border animate-slide-in flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-vault-border">
              <span className="font-heading text-gold font-semibold">Menu</span>
              <button onClick={() => setMobileMenu(false)} className="text-vault-muted hover:text-gold"><X size={20} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenu(false)} className="flex items-center px-6 py-3 text-vault-muted hover:text-gold hover:bg-vault-surface transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-vault-border mt-4 pt-4">
                <Link href="/account" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-6 py-3 text-vault-muted hover:text-gold hover:bg-vault-surface transition-colors">
                  <User size={18} /> My Account
                </Link>
                <Link href="/orders" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-6 py-3 text-vault-muted hover:text-gold hover:bg-vault-surface transition-colors">
                  <ShoppingBag size={18} /> My Orders
                </Link>
              </div>
            </nav>
            <div className="p-4 border-t border-vault-border">
              <a href="https://wa.me/23277416008" target="_blank" rel="noopener noreferrer" className="btn-gold w-full text-center block text-sm py-3">
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

