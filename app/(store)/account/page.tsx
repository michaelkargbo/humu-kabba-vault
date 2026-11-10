'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Package, Heart, MapPin, LogOut, Shield, Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice } from '@/lib/utils'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const wishCount = useWishlist(s => s.ids.length)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    checkUser()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-vault-muted">Loading account...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-vault-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-gradient text-vault-bg font-bold font-heading text-2xl flex items-center justify-center">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-vault-text">
              {user?.email ? user.email.split('@')[0] : 'Guest Customer'}
            </h1>
            <p className="text-sm text-vault-muted">
              {user?.email || 'Browse & order without registration'}
            </p>
          </div>
        </div>

        {user ? (
          <button onClick={handleLogout} className="btn-outline-gold py-2 px-5 text-sm flex items-center gap-2 self-start md:self-auto">
            <LogOut size={16} /> Sign Out
          </button>
        ) : (
          <div className="flex gap-3">
            <Link href="/account/login" className="btn-gold py-2 px-5 text-sm">
              Sign In
            </Link>
            <Link href="/account/register" className="btn-outline-gold py-2 px-5 text-sm">
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Grid of account sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/orders/track" className="card-vault p-6 group">
          <Package className="text-gold mb-3" size={28} />
          <h3 className="font-heading font-semibold text-lg text-vault-text group-hover:text-gold transition-colors">
            My Orders
          </h3>
          <p className="text-xs text-vault-muted mt-1">Track current orders & past deliveries</p>
        </Link>

        <Link href="/wishlist" className="card-vault p-6 group">
          <Heart className="text-gold mb-3" size={28} />
          <h3 className="font-heading font-semibold text-lg text-vault-text group-hover:text-gold transition-colors">
            Wishlist ({wishCount})
          </h3>
          <p className="text-xs text-vault-muted mt-1">Saved favorites ready to purchase</p>
        </Link>

        <Link href="/admin" className="card-vault p-6 group border-gold/40">
          <Shield className="text-gold mb-3" size={28} />
          <h3 className="font-heading font-semibold text-lg text-vault-text group-hover:text-gold transition-colors">
            Admin Dashboard
          </h3>
          <p className="text-xs text-vault-muted mt-1">Boutique inventory & order management</p>
        </Link>
      </div>

      {/* Boutique Support Card */}
      <div className="mt-12 bg-vault-card border border-vault-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-heading font-semibold text-lg text-vault-text">Need Assistance?</h3>
          <p className="text-sm text-vault-muted mt-1">
            Our customer concierge is available Monday to Saturday 09:00 - 19:00.
          </p>
        </div>
        <a
          href="https://wa.me/23277416008"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold py-3 px-6 text-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Phone size={16} /> Contact Concierge (+232 77 416008)
        </a>
      </div>
    </div>
  )
}
