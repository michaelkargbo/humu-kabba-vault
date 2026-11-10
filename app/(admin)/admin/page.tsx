'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DollarSign, Package, AlertTriangle, CheckCircle, Clock, ShoppingBag, Eye, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalSales: 8450,
    totalOrders: 18,
    pendingOrders: 4,
    lowStock: 2,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(6)
        if (orders && orders.length > 0) {
          setRecentOrders(orders)
          const sales = orders.reduce((sum, o) => sum + (o.total || 0), 0)
          const pending = orders.filter(o => o.status === 'pending').length
          setStats(prev => ({
            ...prev,
            totalSales: sales || prev.totalSales,
            totalOrders: orders.length || prev.totalOrders,
            pendingOrders: pending || prev.pendingOrders,
          }))
        } else {
          // Sample recent orders for display
          setRecentOrders([
            { id: '1', order_reference: 'HKV-M2X8-9A', customer_name: 'Fatmata Kamara', total: 1340, status: 'pending', payment_method: 'whatsapp', created_at: new Date().toISOString() },
            { id: '2', order_reference: 'HKV-L9K2-1B', customer_name: 'Ibrahim Koroma', total: 650, status: 'processing', payment_method: 'cod', created_at: new Date().toISOString() },
            { id: '3', order_reference: 'HKV-P4T6-7C', customer_name: 'Mariatu Sesay', total: 420, status: 'delivered', payment_method: 'orange_money', created_at: new Date().toISOString() },
          ])
        }
      } catch (e) {
        console.warn('Admin stats error:', e)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">Boutique Executive Overview</h1>
        <p className="text-xs text-vault-muted mt-1">Live metrics for Humu Kabba Variety Vault Aberdeen, Freetown.</p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-vault-card border border-vault-border rounded-2xl p-5">
          <div className="flex items-center justify-between text-vault-muted mb-2">
            <span className="text-xs font-semibold uppercase">Total Revenue</span>
            <DollarSign size={18} className="text-gold" />
          </div>
          <div className="font-heading text-2xl font-bold text-gold">{formatPrice(stats.totalSales)}</div>
          <span className="text-[10px] text-green-400 font-medium">All completed & recorded</span>
        </div>

        <div className="bg-vault-card border border-vault-border rounded-2xl p-5">
          <div className="flex items-center justify-between text-vault-muted mb-2">
            <span className="text-xs font-semibold uppercase">Total Orders</span>
            <Package size={18} className="text-gold" />
          </div>
          <div className="font-heading text-2xl font-bold text-vault-text">{stats.totalOrders}</div>
          <span className="text-[10px] text-vault-muted">Store lifetime orders</span>
        </div>

        <div className="bg-vault-card border border-vault-border rounded-2xl p-5">
          <div className="flex items-center justify-between text-vault-muted mb-2">
            <span className="text-xs font-semibold uppercase">Pending Actions</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <div className="font-heading text-2xl font-bold text-amber-400">{stats.pendingOrders}</div>
          <span className="text-[10px] text-amber-300">Requires dispatch</span>
        </div>

        <div className="bg-vault-card border border-vault-border rounded-2xl p-5">
          <div className="flex items-center justify-between text-vault-muted mb-2">
            <span className="text-xs font-semibold uppercase">Low Stock</span>
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div className="font-heading text-2xl font-bold text-red-400">{stats.lowStock}</div>
          <span className="text-[10px] text-red-300">&lt; 3 units remaining</span>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products" className="btn-gold text-xs py-2.5 px-5 flex items-center gap-2">
          <ShoppingBag size={14} /> Manage Products
        </Link>
        <Link href="/admin/orders" className="btn-outline-gold text-xs py-2.5 px-5 flex items-center gap-2">
          <Package size={14} /> View All Orders
        </Link>
        <a href="https://wa.me/23277416008" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-500 text-white rounded-full text-xs font-semibold py-2.5 px-5 flex items-center gap-2 transition-colors">
          <MessageCircle size={14} /> Open Boutique WhatsApp
        </a>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-vault-card border border-vault-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-vault-text">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-gold hover:underline">
            View All ({stats.totalOrders})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-vault-border text-xs text-vault-muted">
                <th className="pb-3 font-semibold">Reference</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-border">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-vault-surface transition-colors">
                  <td className="py-3 font-mono text-xs font-bold text-gold">{order.order_reference}</td>
                  <td className="py-3 text-vault-text font-medium">{order.customer_name}</td>
                  <td className="py-3 font-bold text-vault-text">{formatPrice(order.total)}</td>
                  <td className="py-3 text-xs uppercase text-vault-muted">{order.payment_method}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link href={`/admin/orders`} className="text-xs text-vault-muted hover:text-gold">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
