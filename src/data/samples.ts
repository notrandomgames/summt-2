export interface ServiceItem {
  number: string;
  title: string;
  description: string;
}

export const SERVICES: ServiceItem[] = [
  {
    number: '01.',
    title: 'Simple Business Website',
    description:
      'A clean page that loads fast on mobile bundles and shows your services, KSh prices, photos, and opening hours clearly so customers do not have to ask in your DMs.',
  },
  {
    number: '02.',
    title: 'Direct WhatsApp Button',
    description:
      'One tap opens a pre-filled WhatsApp message straight to your phone with the service or meal the customer picked, ready for you to confirm.',
  },
  {
    number: '03.',
    title: 'Google Maps & Search Listing',
    description:
      'I set up and link your Google Business Profile and Maps pin so people searching near your area in Nairobi or your town can actually find your shop.',
  },
  {
    number: '04.',
    title: 'M-Pesa-Ready Checkout & Till Info',
    description:
      'Your M-Pesa Till or Paybill sits clearly on the page with a one-tap copy button, alongside simple order or booking calculators that match your prices.',
  },
];

export interface PricingTier {
  name: string;
  price: string;
  timeline: string;
  description: string;
  items: string[];
  recommended?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter Page',
    price: 'From KSh 200',
    timeline: 'Ready in 1–2 days',
    description:
      'Best if you run your business from Instagram, TikTok, or WhatsApp and want one clean link with your prices and location.',
    items: [
      'Single-page mobile site with your brand name',
      'Service or product price list in KSh',
      'Direct WhatsApp chat button',
      'Google Maps location link',
      'M-Pesa Till or Paybill display',
    ],
  },
  {
    name: 'Full Local Business Site',
    price: 'From KSh 4,500',
    timeline: 'Ready in 4–7 days',
    description:
      'For salons, barbershops, clinics, and retail shops that want a proper website customers find on Google.',
    items: [
      'Multi-section website with photo gallery',
      'Google Business Profile & Maps setup',
      'Pre-filled WhatsApp booking form',
      'M-Pesa Till copy & payment guide',
      'Fast loading on mobile data',
    ],
    recommended: true,
  },
  {
    name: 'Custom Order & Booking Site',
    price: 'From KSh 9,500',
    timeline: 'Ready in 1–2 weeks',
    description:
      'For caterers, food spots, and busy shops that need an interactive quote calculator or multi-category menu.',
    items: [
      'Interactive price or guest-count estimator',
      'Category filters for menus or products',
      'Itemized order summary sent to WhatsApp',
      'Custom .co.ke or .com domain setup help',
      'Two rounds of content & price updates',
    ],
  },
];
