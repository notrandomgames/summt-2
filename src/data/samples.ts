export const CONTACT_INFO = {
  ownerName: 'Emmanuel Nthiga',
  brandName: 'Summit',
  city: 'Nairobi, Kenya',
  phoneDisplay: '0700 000 000',
  phoneHref: 'tel:+254700000000',
  whatsappNumber: '254700000000',
  email: 'emmannthiga25@gmail.com',
  instagramHandle: '@summit._digital',
  instagramUrl: 'https://instagram.com/summit._digital',
} as const;

export function getWhatsAppUrl(prefillText?: string): string {
  const text =
    prefillText ??
    'Hi Emmanuel, I saw your website and I would like to ask about a website for my business.';
  return `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export type SampleSlug = 'salon' | 'barbershop' | 'caterer';

export interface SampleProjectMeta {
  slug: SampleSlug;
  title: string;
  category: 'beauty' | 'food';
  categoryLabel: string;
  location: string;
  image: string;
  imageAlt: string;
  summary: string;
  includedFeatures: string[];
}

export const SAMPLE_PROJECTS: SampleProjectMeta[] = [
  {
    slug: 'salon',
    title: 'Zuri Hair & Beauty Salon',
    category: 'beauty',
    categoryLabel: 'Sample project · Salon',
    location: 'Kilimani, Nairobi',
    image: '/src/assets/images/demo_salon_1795541847197.jpg',
    imageAlt:
      'Interior of Zuri Hair & Beauty Salon in Kilimani with styling mirrors and natural hair products',
    summary:
      'A mobile-friendly salon page with a full KSh price menu for braids, silk press, and nails, plus one-tap WhatsApp booking and M-Pesa Till details.',
    includedFeatures: ['KSh price list', 'WhatsApp booking', 'M-Pesa Till copy', 'Google Maps pin'],
  },
  {
    slug: 'barbershop',
    title: 'Kicks & Clips Barbershop',
    category: 'beauty',
    categoryLabel: 'Sample project · Barbershop',
    location: 'Westlands, Nairobi',
    image: '/src/assets/images/demo_barbershop_1795541847917.jpg',
    imageAlt: 'Clean barbershop interior in Nairobi with leather chairs and wooden counters',
    summary:
      'Built for walk-ins and regulars to check fade and beard trim prices, pick a free time slot, and reserve their chair on WhatsApp.',
    includedFeatures: ['Grooming menu', 'Time slot picker', 'WhatsApp booking', 'M-Pesa Till copy'],
  },
  {
    slug: 'caterer',
    title: 'Mama Wanjiku Kitchen & Catering',
    category: 'food',
    categoryLabel: 'Sample project · Catering',
    location: 'Nairobi & Kiambu',
    image: '/src/assets/images/demo_caterer_1795541848643.jpg',
    imageAlt: 'Kenyan catering spread with beef pilau, nyama choma, chapatis, and kachumbari',
    summary:
      'An event and office-lunch site where clients pick a menu, enter their guest count, see the KSh estimate immediately, and send the order on WhatsApp.',
    includedFeatures: ['Event menu', 'Guest cost calculator', 'WhatsApp order', 'Delivery zones'],
  },
];

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
