'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/Toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Signed in successfully!')
        router.push('/account')
      }
    } catch (err: any) {
      toast.error('Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-vault-card border border-vault-border rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-vault-text">Customer Login</h1>
          <p className="text-sm text-vault-muted mt-1">Welcome back to Humu Kabba Variety Vault</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-vault-text mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
              <input
                type="email"
                required
                placeholder="mariama@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-vault pl-10 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-vault-text mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-vault pl-10 py-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center text-xs text-vault-muted space-y-2 pt-2 border-t border-vault-border">
          <p>
            Don't have an account?{' '}
            <Link href="/account/register" className="text-gold font-semibold hover:underline">
              Create an Account
            </Link>
          </p>
          <p>
            <Link href="/shop" className="text-vault-muted hover:text-vault-text">
              Continue as Guest
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
