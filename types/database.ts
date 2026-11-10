export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; full_name: string | null; phone: string | null; avatar_url: string | null; is_admin: boolean; created_at: string }
        Insert: { id: string; email: string; full_name?: string | null; phone?: string | null; avatar_url?: string | null; is_admin?: boolean }
        Update: { full_name?: string | null; phone?: string | null; avatar_url?: string | null }
      }
      categories: {
        Row: { id: string; name: string; slug: string; description: string | null; image_url: string | null; parent_id: string | null; sort_order: number; active: boolean; created_at: string }
        Insert: { name: string; slug: string; description?: string | null; image_url?: string | null; parent_id?: string | null; sort_order?: number; active?: boolean }
        Update: { name?: string; slug?: string; description?: string | null; image_url?: string | null; sort_order?: number; active?: boolean }
      }
      products: {
        Row: { id: string; name: string; slug: string; description: string | null; category_id: string | null; brand: string | null; price: number; original_price: number | null; discount_percent: number; sku: string | null; stock_quantity: number; status: 'active' | 'draft' | 'archived'; featured: boolean; is_new: boolean; is_best_seller: boolean; images: Json; tags: string[]; created_at: string; updated_at: string }
        Insert: { name: string; slug: string; description?: string | null; category_id?: string | null; brand?: string | null; price: number; original_price?: number | null; discount_percent?: number; sku?: string | null; stock_quantity?: number; status?: 'active' | 'draft' | 'archived'; featured?: boolean; is_new?: boolean; is_best_seller?: boolean; images?: Json; tags?: string[] }
        Update: { name?: string; slug?: string; description?: string | null; price?: number; original_price?: number | null; stock_quantity?: number; status?: 'active' | 'draft' | 'archived'; featured?: boolean; images?: Json }
      }
      product_variations: {
        Row: { id: string; product_id: string; type: string; value: string; price_adjustment: number; sku: string | null; stock: number; image_url: string | null; active: boolean }
        Insert: { product_id: string; type: string; value: string; price_adjustment?: number; sku?: string | null; stock?: number; image_url?: string | null; active?: boolean }
        Update: { price_adjustment?: number; stock?: number; active?: boolean; image_url?: string | null }
      }
      orders: {
        Row: { id: string; order_reference: string; user_id: string | null; customer_name: string; customer_phone: string; customer_email: string | null; delivery_address: string; delivery_zone_id: string | null; delivery_fee: number; delivery_instructions: string | null; items: Json; subtotal: number; discount_amount: number; total: number; payment_method: string; payment_status: 'pending' | 'paid' | 'failed' | 'refunded'; payment_reference: string | null; status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'; notes: string | null; created_at: string; updated_at: string }
        Insert: { order_reference: string; user_id?: string | null; customer_name: string; customer_phone: string; customer_email?: string | null; delivery_address: string; delivery_zone_id?: string | null; delivery_fee?: number; delivery_instructions?: string | null; items: Json; subtotal: number; discount_amount?: number; total: number; payment_method: string; payment_status?: string; status?: string }
        Update: { status?: string; payment_status?: string; payment_reference?: string | null; notes?: string | null }
      }
      delivery_zones: {
        Row: { id: string; name: string; regions: string[]; fee: number; free_above: number | null; estimated_days: string; active: boolean; created_at: string }
        Insert: { name: string; regions: string[]; fee: number; free_above?: number | null; estimated_days?: string; active?: boolean }
        Update: { name?: string; fee?: number; free_above?: number | null; active?: boolean }
      }
      wishlists: {
        Row: { id: string; user_id: string; product_id: string; created_at: string }
        Insert: { user_id: string; product_id: string }
        Update: never
      }
      reviews: {
        Row: { id: string; product_id: string; user_id: string; order_id: string | null; rating: number; title: string | null; body: string | null; images: string[]; verified_purchase: boolean; approved: boolean; created_at: string }
        Insert: { product_id: string; user_id: string; order_id?: string | null; rating: number; title?: string | null; body?: string | null; images?: string[] }
        Update: { approved?: boolean }
      }
      coupons: {
        Row: { id: string; code: string; type: 'percent' | 'fixed' | 'free_shipping'; value: number; min_order: number; max_uses: number | null; used_count: number; starts_at: string | null; expires_at: string | null; active: boolean; created_at: string }
        Insert: { code: string; type: 'percent' | 'fixed' | 'free_shipping'; value: number; min_order?: number; max_uses?: number | null; starts_at?: string | null; expires_at?: string | null; active?: boolean }
        Update: { active?: boolean; used_count?: number }
      }
      banners: {
        Row: { id: string; title: string; body: string | null; image_url: string; link_url: string | null; active: boolean; sort_order: number; created_at: string }
        Insert: { title: string; body?: string | null; image_url: string; link_url?: string | null; active?: boolean; sort_order?: number }
        Update: { title?: string; image_url?: string; active?: boolean; sort_order?: number }
      }
      transactions: {
        Row: { id: string; order_id: string; provider: string; reference: string; amount: number; currency: string; status: string; raw_response: Json | null; created_at: string }
        Insert: { order_id: string; provider: string; reference: string; amount: number; currency?: string; status: string; raw_response?: Json | null }
        Update: { status?: string; raw_response?: Json | null }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductVariation = Database['public']['Tables']['product_variations']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type DeliveryZone = Database['public']['Tables']['delivery_zones']['Row']
export type Wishlist = Database['public']['Tables']['wishlists']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']
export type Banner = Database['public']['Tables']['banners']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']

// Cart types (client-side only)
export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  variationId?: string
  variationLabel?: string
  slug: string
}

export interface CartState {
  items: CartItem[]
  couponCode?: string
  discountAmount: number
}

