export interface Product {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  img: string;
  price: number;
  compare: number;
  off: string;
  badge: string;
  badgeLabel: string;
  rating: number;
  reviews: number;
  isNew: boolean;
  description: string;
  ingredients?: string[];
  benefits?: string[];
}

export const products: Product[] = [
  {
    id: 'p1',
    slug: 'boost-3499',
    name: 'Jevansrot Boost Medicine',
    vendor: 'Jevansrot',
    img: '/products/boost-3499.webp',
    price: 3499,
    compare: 4999,
    off: '30% OFF',
    badge: 'b-pop',
    badgeLabel: 'Popular',
    rating: 4.8,
    reviews: 1247,
    isNew: false,
    description: 'A powerful daily boost formula designed to naturally enhance your energy levels, stamina, and overall vitality using our patented nano-technology.',
    ingredients: ['Ashwagandha Extract', 'Ginseng', 'Vitamin B Complex'],
    benefits: ['Boosts Energy', 'Improves Focus', 'Reduces Fatigue']
  },
  {
    id: 'p2',
    slug: 'highpower-combo-3999',
    name: 'High Power Combo',
    vendor: 'Jevansrot',
    img: '/products/highpower-combo-3999.webp',
    price: 3999,
    compare: 5499,
    off: '27% OFF',
    badge: 'b-pop',
    badgeLabel: 'Best Seller',
    rating: 4.9,
    reviews: 2143,
    isNew: false,
    description: 'Our ultimate high-power combo pack for complete performance enhancement. Formulated for maximum absorption and long-lasting results.',
    ingredients: ['Shilajit Gold', 'Safed Musli', 'Gokshura'],
    benefits: ['Enhances Strength', 'Improves Endurance', 'Supports Muscle Recovery']
  },
  {
    id: 'p3',
    slug: 'Insane-combo-2999',
    name: 'Insane Power Combo',
    vendor: 'Jevansrot',
    img: '/products/insan-combo-2999.webp',
    price: 2999,
    compare: 3999,
    off: '25% OFF',
    badge: 'b-off',
    badgeLabel: 'Sale',
    rating: 4.7,
    reviews: 843,
    isNew: false,
    description: 'A balanced power combination specifically created for sustained daily performance and metabolic support.',
    ingredients: ['Maca Root', 'Tribulus Terrestris', 'Zinc'],
    benefits: ['Supports Metabolism', 'Daily Wellness', 'Balanced Energy']
  },
  {
    id: 'p4',
    slug: 'medicine-combo-3499',
    name: 'Medicine Combo Pack',
    vendor: 'Jevansrot',
    img: '/products/medicine-combo-3499.webp',
    price: 3499,
    compare: 4499,
    off: '22% OFF',
    badge: 'b-new',
    badgeLabel: 'New',
    rating: 4.8,
    reviews: 612,
    isNew: true,
    description: 'A comprehensive wellness stack combining our best-selling daily medicines for complete immune and vitality support.',
    ingredients: ['Curcumin Nano', 'Vitamin C', 'Zinc', 'Elderberry'],
    benefits: ['Immune Support', 'Antioxidant Protection', 'Cellular Health']
  },
  {
    id: 'p5',
    slug: 'medicine-1999',
    name: 'Jevansrot Daily Medicine',
    vendor: 'Jevansrot',
    img: '/products/medicine-1999.webp',
    price: 1999,
    compare: 2999,
    off: '33% OFF',
    badge: 'b-off',
    badgeLabel: 'Sale',
    rating: 4.6,
    reviews: 534,
    isNew: false,
    description: 'Your everyday foundation for health. This daily medicine ensures your body gets the essential micronutrients it needs.',
    ingredients: ['Multivitamin Blend', 'Mineral Complex', 'Probiotics'],
    benefits: ['Fills Nutritional Gaps', 'Gut Health', 'Daily Support']
  },
  {
    id: 'p6',
    slug: 'oil-high-power-999',
    name: 'Oil High Power',
    vendor: 'Jevansrot',
    img: '/products/oil-999.webp',
    price: 999,
    compare: 1499,
    off: '33% OFF',
    badge: 'b-new',
    badgeLabel: 'New',
    rating: 4.7,
    reviews: 378,
    isNew: true,
    description: 'A highly concentrated topical oil formulated with traditional herbs for localized strength and performance support.',
    ingredients: ['Jyotishmati Oil', 'Clove Oil', 'Malkangni'],
    benefits: ['Fast Absorption', 'Localized Support', 'Traditional Formula']
  },
  {
    id: 'p7',
    slug: 'spray-1499',
    name: 'Jevansrot Power Spray',
    vendor: 'Jevansrot',
    img: '/products/spray-1499.webp',
    price: 1499,
    compare: 1999,
    off: '25% OFF',
    badge: 'b-pop',
    badgeLabel: 'Popular',
    rating: 4.8,
    reviews: 921,
    isNew: false,
    description: 'An innovative, fast-acting sublingual spray designed for immediate absorption and rapid performance enhancement.',
    ingredients: ['Nano-Emulsified Actives', 'Peppermint Extract'],
    benefits: ['Instant Absorption', 'Convenient', 'Fast Acting']
  },
];