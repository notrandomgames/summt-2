import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Copy,
  MapPin,
  Clock,
  MessageCircle,
  Phone,
  Scissors,
} from 'lucide-react';
import { ANTICIPATION_HOVER, SQUASH_TAP } from '../lib/motionPresets';

interface SampleSalonPageProps {
  onBack: () => void;
}

interface SalonService {
  id: string;
  name: string;
  category: 'braids' | 'natural' | 'nails';
  duration: string;
  price: number;
}

const SALON_SERVICES: SalonService[] = [
  { id: 'knotless', name: 'Medium Knotless Braids', category: 'braids', duration: '3 hrs', price: 2500 },
  { id: 'locs', name: 'Faux Locs / Retouch', category: 'braids', duration: '2.5 hrs', price: 2000 },
  { id: 'cornrows', name: 'Stitch Cornrows', category: 'braids', duration: '1.5 hrs', price: 1200 },
  { id: 'silkpress', name: 'Wash, Blow-dry & Silk Press', category: 'natural', duration: '1.5 hrs', price: 1800 },
  { id: 'treatment', name: 'Deep Moisture Steam Treatment', category: 'natural', duration: '1 hr', price: 1000 },
  { id: 'gelmani', name: 'Gel Manicure', category: 'nails', duration: '45 mins', price: 1000 },
  { id: 'pedicure', name: 'Spa Pedicure & Gel Polish', category: 'nails', duration: '1 hr', price: 1500 },
];

export function SampleSalonPage({ onBack }: SampleSalonPageProps) {
  const [category, setCategory] = useState<'all' | 'braids' | 'natural' | 'nails'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>(['knotless']);
  const [stylist, setStylist] = useState('Any available stylist');
  const [dayTime, setDayTime] = useState('Saturday · 10:00 AM');
  const [clientName, setClientName] = useState('');
  const [copiedTill, setCopiedTill] = useState(false);
  const [bookingPrepared, setBookingPrepared] = useState(false);

  const visibleServices =
    category === 'all' ? SALON_SERVICES : SALON_SERVICES.filter((s) => s.category === category);

  const selectedServices = SALON_SERVICES.filter((s) => selectedIds.includes(s.id));
  const totalKsh = selectedServices.reduce((sum, item) => sum + item.price, 0);

  const toggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setBookingPrepared(false);
  };

  const handleCopyTill = async () => {
    try {
      await navigator.clipboard.writeText('5482910');
    } catch {
      // Ignore clipboard failure
    }
    setCopiedTill(true);
    setTimeout(() => setCopiedTill(false), 2200);
  };

  const whatsappMessage = `Hi Zuri Salon, I'd like to book: ${
    selectedServices.length > 0
      ? selectedServices.map((s) => `${s.name} (KSh ${s.price.toLocaleString()})`).join(', ')
      : 'a salon appointment'
  }. Preferred time: ${dayTime}. Stylist: ${stylist}.${
    clientName.trim() ? ` Name: ${clientName.trim()}.` : ''
  } Estimated total: KSh ${totalKsh.toLocaleString()}.`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900">
      <div className="border-b border-stone-200 bg-stone-900 px-4 py-2.5 text-stone-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <motion.button
            type="button"
            whileTap={SQUASH_TAP}
            onClick={onBack}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 font-medium text-white hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Summit
          </motion.button>
          <span className="text-stone-300">
            Sample project built by Emmanuel Nthiga · Local Salon Demo
          </span>
        </div>
      </div>

      <header className="border-b border-stone-200/80 bg-[#FAF8F5]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <span className="font-display text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap">
            Zuri Hair & Beauty
          </span>
          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 sm:flex">
            <a href="#salon-menu" className="hover:text-stone-900">
              Prices
            </a>
            <a href="#salon-book" className="hover:text-stone-900">
              Book
            </a>
            <a href="#salon-visit" className="hover:text-stone-900">
              Location
            </a>
          </nav>
          <motion.a
            whileHover={ANTICIPATION_HOVER}
            whileTap={SQUASH_TAP}
            href="#salon-book"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-[#7C2D12] px-4 py-2 text-sm font-medium text-white whitespace-nowrap transition-colors hover:bg-[#65230D]"
          >
            Book on WhatsApp
          </motion.a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <section className="grid items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-medium text-[#7C2D12]">
              Kilimani, Nairobi · Off Argwings Kodhek Rd
            </p>
            <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl text-balance">
              Natural hair, neat braids, and clean nail care in Kilimani.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600">
              Check our exact prices below, tap the services you want, and send your booking straight to our salon WhatsApp line.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <motion.a
                whileHover={ANTICIPATION_HOVER}
                whileTap={SQUASH_TAP}
                href="#salon-menu"
                className="inline-flex min-h-[48px] items-center rounded-lg bg-[#7C2D12] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#65230D]"
              >
                Pick services & prices
              </motion.a>
              <a
                href="https://maps.google.com/?q=Kilimani+Nairobi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
              >
                <MapPin className="h-4 w-4 text-[#7C2D12]" />
                Directions on Google Maps
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] overflow-hidden rounded-xl border border-stone-200 bg-stone-200">
              <img
                src="/src/assets/images/demo_salon_1795541847197.jpg"
                alt="Zuri Hair and Beauty Salon interior in Kilimani"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section id="salon-menu" className="mt-14 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-900">
                  Service Price List
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  Tap any service to add it to your WhatsApp booking request.
                </p>
              </div>
              <div className="flex flex-wrap gap-1 rounded-lg bg-stone-200/70 p-1">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'braids', label: 'Braids & Locs' },
                    { id: 'natural', label: 'Natural Hair' },
                    { id: 'nails', label: 'Nails' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategory(tab.id)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      category === tab.id
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
              {visibleServices.map((service) => {
                const isSelected = selectedIds.includes(service.id);
                return (
                  <motion.button
                    key={service.id}
                    type="button"
                    whileTap={{ scale: 0.99 }}
                    onClick={() => toggleService(service.id)}
                    className={`flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${
                      isSelected ? 'bg-[#7C2D12]/5' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          isSelected
                            ? 'border-[#7C2D12] bg-[#7C2D12] text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <div>
                        <p className="font-medium text-stone-900">{service.name}</p>
                        <p className="text-xs text-stone-500">Approx. {service.duration}</p>
                      </div>
                    </div>
                    <span className="font-mono-num text-sm font-semibold text-stone-900 whitespace-nowrap">
                      KSh {service.price.toLocaleString()}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div id="salon-book" className="lg:col-span-5">
            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-stone-900">
                    Your Booking Request
                  </h3>
                  <p className="text-xs text-stone-500">
                    {selectedServices.length} service{selectedServices.length === 1 ? '' : 's'} selected
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-stone-500">Est. total</span>
                  <span className="font-mono-num text-lg font-bold text-[#7C2D12]">
                    KSh {totalKsh.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="salon-client-name" className="block text-xs font-medium text-stone-700">
                    Your name (optional)
                  </label>
                  <input
                    id="salon-client-name"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Faith Njeri"
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-[#7C2D12] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="salon-day" className="block text-xs font-medium text-stone-700">
                    Preferred day & time
                  </label>
                  <select
                    id="salon-day"
                    value={dayTime}
                    onChange={(e) => setDayTime(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#7C2D12] focus:outline-none"
                  >
                    <option>Today · 2:00 PM</option>
                    <option>Tomorrow · 10:00 AM</option>
                    <option>Friday · 3:30 PM</option>
                    <option>Saturday · 10:00 AM</option>
                    <option>Sunday · 12:00 PM</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="salon-stylist" className="block text-xs font-medium text-stone-700">
                    Stylist preference
                  </label>
                  <select
                    id="salon-stylist"
                    value={stylist}
                    onChange={(e) => setStylist(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#7C2D12] focus:outline-none"
                  >
                    <option>Any available stylist</option>
                    <option>Amina (Braids & Locs)</option>
                    <option>Wanjiru (Natural Hair & Silk Press)</option>
                    <option>Mercy (Nails & Pedicure)</option>
                  </select>
                </div>

                <div className="rounded-lg bg-stone-50 p-3 text-xs leading-relaxed text-stone-600">
                  <span className="font-semibold text-stone-800">WhatsApp preview:</span>{' '}
                  {whatsappMessage}
                </div>

                <div className="flex flex-col gap-2">
                  <motion.a
                    whileHover={ANTICIPATION_HOVER}
                    whileTap={SQUASH_TAP}
                    href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setBookingPrepared(true)}
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#0F5C43] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4734]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Booking on WhatsApp
                  </motion.a>
                  {bookingPrepared && (
                    <p className="text-center text-xs font-medium text-[#0F5C43]">
                      WhatsApp message prepared for Zuri Hair & Beauty (sample demo).
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-stone-500">Lipa na M-Pesa · Buy Goods Till</p>
                    <p className="font-mono-num text-base font-bold text-stone-900">548 2910</p>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={SQUASH_TAP}
                    onClick={handleCopyTill}
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-50"
                  >
                    {copiedTill ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#0F5C43]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Till
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="salon-visit"
          className="mt-14 grid gap-6 rounded-xl border border-stone-200 bg-white p-6 sm:grid-cols-3 sm:p-8"
        >
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#7C2D12]" />
            <div>
              <h3 className="font-display text-sm font-semibold text-stone-900">Location</h3>
              <p className="mt-1 text-sm text-stone-600">
                1st Floor, Kilimani Corner Court, off Argwings Kodhek Rd, Nairobi
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#7C2D12]" />
            <div>
              <h3 className="font-display text-sm font-semibold text-stone-900">Opening Hours</h3>
              <p className="mt-1 text-sm text-stone-600">
                Tuesday – Sunday: 8:30 AM – 7:30 PM (Closed Mondays)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#7C2D12]" />
            <div>
              <h3 className="font-display text-sm font-semibold text-stone-900">Walk-ins & Calls</h3>
              <p className="mt-1 text-sm text-stone-600">
                Sample phone: <span className="font-mono-num">0700 000 111</span> ·{' '}
                <Scissors className="inline h-3.5 w-3.5" /> Walk-ins welcome
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
