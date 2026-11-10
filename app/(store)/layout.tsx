import { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import ToastContainer from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Humu Kabba Variety Vault — Fashion, Beauty & Lifestyle Sierra Leone',
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="min-h-screen pt-24 lg:pt-28">
        {children}
      </main>
      <Footer />
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
      <ToastContainer />
    </>
  )
}

