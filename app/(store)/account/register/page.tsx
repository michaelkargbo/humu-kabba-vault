'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/Toast'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created! Please check your email or proceed to sign in.')
        router.push('/account')
      }
    } catch (err: any) {
      toast.error('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-vault-card border border-vault-border rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-vault-text">Create Account</h1>
          <p className="text-sm text-vault-muted mt-1">Join the Humu Kabba Variety Vault family</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-vault-text mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
              <input
                type="text"
                required
                placeholder="Mariama Sesay"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-vault pl-10 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-vault-text mb-1.5">Phone Number (WhatsApp)</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
              <input
                type="tel"
                required
                placeholder="+232 77 416008"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input-vault pl-10 py-2.5 text-sm"
              />
            </div>
          </div>

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
            <label className="block text-xs font-medium text-vault-text mb-1.5">Create Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
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
            {loading ? 'Creating...' : 'Register'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center text-xs text-vault-muted pt-2 border-t border-vault-border">
          Already have an account?{' '}
          <Link href="/account/login" className="text-gold font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
