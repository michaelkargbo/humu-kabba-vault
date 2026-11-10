'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, TrendingUp, ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import CartDrawer from '../cart/CartDrawer'

const NAV = [
  { label: 'Shop', href: '/', icon: Home },
  { label: 'Category', href: '/shop', icon: Grid },
  { label: 'Trends', href: '/shop?sort=trending', icon: TrendingUp },
  { label: 'Cart', href: '#cart', icon: ShoppingBag },
  { label: 'Me', href: '/account', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const cartCount = useCart(s => s.getCount())
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-vault-surface/95 backdrop-blur-md border-t border-vault-border safe-bottom">
        <div className="flex items-center justify-around h-16">
          {NAV.map(({ label, href, icon: Icon }) => {
            const isCart = href === '#cart'
            const isActive = !isCart && (href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]))

            if (isCart) {
              return (
                <button key={label} onClick={() => setCartOpen(true)} className={cn('bottom-nav-item', cartCount > 0 && 'active')}>
                  <div className="relative">
                    <Icon size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-gold text-vault-bg text-xs font-bold rounded-full flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span>{label}</span>
                </button>
              )
            }

            return (
              <Link key={label} href={href} className={cn('bottom-nav-item', isActive && 'active')}>
                <Icon size={22} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

