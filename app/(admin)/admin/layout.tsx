'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Users, Truck, Tag, Settings, ArrowLeft } from 'lucide-react'
import ToastContainer from '@/components/ui/Toast'

const ADMIN_LINKS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: Package },
  { label: 'Products', href: '/admin/products', icon: ShoppingBag },
  { label: 'Delivery Zones', href: '/admin/delivery', icon: Truck },
  { label: 'Promotions', href: '/admin/promotions', icon: Tag },
  { label: 'Store Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-vault-bg flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-vault-border bg-vault-surface hidden md:flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gold-gradient text-vault-bg font-heading font-bold flex items-center justify-center text-lg">
              HK
            </div>
            <div>
              <div className="font-heading font-bold text-vault-text text-sm">Humu Kabba</div>
              <div className="text-[10px] text-gold tracking-widest uppercase">Admin Portal</div>
            </div>
          </div>

          <nav className="space-y-1">
            {ADMIN_LINKS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gold text-vault-bg font-bold shadow-md'
                      : 'text-vault-muted hover:text-vault-text hover:bg-vault-card'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-vault-border">
          <Link href="/" className="flex items-center gap-2 text-xs text-vault-muted hover:text-gold px-2 transition-colors">
            <ArrowLeft size={14} /> Back to Live Store
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-vault-border bg-vault-surface/60 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="md:hidden text-xs text-vault-muted hover:text-gold flex items-center gap-1">
              <ArrowLeft size={14} /> Store
            </Link>
            <span className="font-heading font-bold text-vault-text text-lg">Admin Management</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-vault-muted hidden sm:inline">Supabase Connected</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}
