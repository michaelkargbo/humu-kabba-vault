import ProductDetailClient from '@/components/product/ProductDetailClient'

const CATALOG: Record<string, any> = {
  'evening-gown': {
    id: 's1',
    name: 'Evening Gown Collection',
    slug: 'evening-gown',
    price: 850,
    original_price: 1200,
    discount_percent: 29,
    stock_quantity: 5,
    brand: 'Humu Kabba Luxury',
    description: 'Luxury evening gowns crafted from premium satin and delicate lace. Designed for galas, weddings, and formal occasions where elegance is essential.',
    images: ['/assets/dresses.jpg', '/assets/beauty.jpg', '/assets/bags.jpg'],
    colors: ['Emerald Green', 'Royal Navy', 'Burgundy Wine', 'Champagne Gold'],
    sizes: ['UK 8 / S', 'UK 10 / M', 'UK 12 / L', 'UK 14 / XL'],
    details: ['Material: 95% Silk Satin, 5% Elastane', 'Dry clean only', 'Concealed back zip', 'Floor length'],
  },
  'designer-handbag': {
    id: 's2',
    name: 'Designer Handbag Set',
    slug: 'designer-handbag',
    price: 650,
    original_price: 900,
    discount_percent: 28,
    stock_quantity: 8,
    brand: 'Humu Kabba Leather',
    description: 'Premium designer-inspired structured handbag with matching clutch and cardholder. Durable vegan leather with luxury gold-tone hardware.',
    images: ['/assets/bags.jpg', '/assets/dresses.jpg', '/assets/shoes.jpg'],
    colors: ['Onyx Black', 'Caramel Tan', 'Burgundy', 'Ivory Cream'],
    sizes: ['Standard Set (3-Piece)'],
    details: ['High-grade pebbled vegan leather', 'Detachable shoulder strap', 'Internal zip pocket', 'Protective bottom metal studs'],
  },
  'luxury-perfume': {
    id: 's3',
    name: 'Luxury Perfume Bundle',
    slug: 'luxury-perfume',
    price: 420,
    original_price: 600,
    discount_percent: 30,
    stock_quantity: 12,
    brand: 'Humu Kabba Fragrance',
    description: 'Exquisite fragrance collection featuring floral, oriental, and warm amber notes with 24-hour long-lasting sillage.',
    images: ['/assets/beauty.jpg', '/assets/dresses.jpg'],
    colors: ['Eau De Parfum 100ml'],
    sizes: ['100ml Bottle', 'Bundle (100ml + 30ml Travel Spray)'],
    details: ['Top notes: Bergamot, Rose', 'Heart notes: Jasmine, Vanilla orchid', 'Base notes: Amber, Cedarwood, Musk'],
  },
}

export function generateStaticParams() {
  return [
    { slug: 'evening-gown' },
    { slug: 'designer-handbag' },
    { slug: 'luxury-perfume' },
  ]
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const product = CATALOG[slug] || {
    id: 'custom-' + slug,
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    slug,
    price: 350,
    original_price: 500,
    discount_percent: 30,
    stock_quantity: 10,
    brand: 'Humu Kabba',
    description: 'A signature premium piece from Humu Kabba Variety Vault. Crafted with high quality materials and designed to make an impression.',
    images: ['/assets/dresses.jpg', '/assets/bags.jpg'],
    colors: ['Gold', 'Black', 'Emerald'],
    sizes: ['Standard'],
    details: ['Imported luxury piece', 'Quality inspected', 'Exclusive Vault Edition'],
  }

  return <ProductDetailClient product={product} />
}
