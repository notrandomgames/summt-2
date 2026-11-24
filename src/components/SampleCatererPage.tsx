import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Copy,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Utensils,
} from 'lucide-react';
import { ANTICIPATION_HOVER, SQUASH_TAP } from '../lib/motionPresets';

interface SampleCatererPageProps {
  onBack: () => void;
}

const CATERING_MENUS = [
  {
    id: 'pilau',
    name: 'Beef Pilau, Kachumbari & Mukimo',
    detail: 'Spiced coastal-style beef pilau served with fresh kachumbari and greens.',
    pricePerPlate: 450,
  },
  {
    id: 'nyama',
    name: 'Nyama Choma Feast Platter',
    detail: 'Charcoal-grilled goat & beef choma, ugali, roast potatoes, and kachumbari.',
    pricePerPlate: 950,
  },
  {
    id: 'chapati',
    name: 'Layered Chapatis, Beef Stew & Ndengu',
    detail: 'Soft home-style chapatis with slow-cooked beef stew, coconut ndengu, and managu.',
    pricePerPlate: 500,
  },
  {
    id: 'office',
    name: 'Corporate Office Lunch Box',
    detail: 'Individual sealed lunch packs for meetings, workshops, and chama gatherings.',
    pricePerPlate: 550,
  },
];

export function SampleCatererPage({ onBack }: SampleCatererPageProps) {
  const [selectedMenuId, setSelectedMenuId] = useState('pilau');
  const [guests, setGuests] = useState(30);
  const [includeJuice, setIncludeJuice] = useState(true);
  const [includeChafers, setIncludeChafers] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventArea, setEventArea] = useState('Nairobi (Kilimani / Westlands / CBD)');
  const [copiedTill, setCopiedTill] = useState(false);

  const selectedMenu = CATERING_MENUS.find((m) => m.id === selectedMenuId) || CATERING_MENUS[0];
  const foodSubtotal = selectedMenu.pricePerPlate * guests;
  const juiceTotal = includeJuice ? 120 * guests : 0;
  const chaferTotal = includeChafers ? 3500 : 0;
  const estimatedTotal = foodSubtotal + juiceTotal + chaferTotal;

  const handleCopyTill = async () => {
    try {
      await navigator.clipboard.writeText('8841203');
    } catch {
      // Ignore clipboard failure
    }
    setCopiedTill(true);
    setTimeout(() => setCopiedTill(false), 2200);
  };

  const whatsappOrder = `Hi Mama Wanjiku Kitchen, I'd like a quote for ${guests} guests: ${selectedMenu.name} (KSh ${selectedMenu.pricePerPlate}/plate)${
    includeJuice ? ' + Fresh Juice' : ''
  }${includeChafers ? ' + Chafing Dishes & Serving' : ''}. Location: ${eventArea}${
    eventDate ? `. Date: ${eventDate}` : ''
  }. Estimated total: KSh ${estimatedTotal.toLocaleString()}.`;

  return (
    <div className="min-h-screen bg-[#FCF9F5] text-stone-900">
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
            Sample project built by Emmanuel Nthiga · Local Catering Demo
          </span>
        </div>
      </div>

      <header className="border-b border-stone-200 bg-[#FCF9F5]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <span className="font-display text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap">
            Mama Wanjiku Kitchen
          </span>
          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 sm:flex">
            <a href="#caterer-menu" className="hover:text-stone-900">
              Menus
            </a>
            <a href="#caterer-quote" className="hover:text-stone-900">
              Guest Calculator
            </a>
          </nav>
          <motion.a
            whileHover={ANTICIPATION_HOVER}
            whileTap={SQUASH_TAP}
            href="#caterer-quote"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-[#9A3412] px-4 py-2 text-sm font-medium text-white whitespace-nowrap transition-colors hover:bg-[#7C2D12]"
          >
            Calculate quote
          </motion.a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <section className="grid items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-medium text-[#9A3412]">
              Nairobi & Kiambu · Office Lunches, Chama & Family Events
            </p>
            <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl text-balance">
              Hot Kenyan meals cooked fresh for your event or office team.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600">
              Choose a menu package, enter how many guests you are hosting, and get an instant estimate in shillings before sending your order on WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <motion.a
                whileHover={ANTICIPATION_HOVER}
                whileTap={SQUASH_TAP}
                href="#caterer-quote"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-[#9A3412] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C2D12]"
              >
                <Utensils className="h-4 w-4" />
                Estimate your event cost
              </motion.a>
              <span className="text-sm text-stone-600">Minimum order: 10 plates</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] overflow-hidden rounded-xl border border-stone-200 bg-stone-200">
              <img
                src="/src/assets/images/demo_caterer_1795541848643.jpg"
                alt="Mama Wanjiku Kitchen Kenyan pilau, nyama choma, and chapatis"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section id="caterer-menu" className="mt-14 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl font-bold text-stone-900">
              Choose a Catering Package
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Per-plate prices include clean disposable packs or buffet trays.
            </p>

            <div className="mt-5 grid gap-3">
              {CATERING_MENUS.map((menu) => {
                const active = menu.id === selectedMenuId;
                return (
                  <motion.button
                    key={menu.id}
                    type="button"
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedMenuId(menu.id)}
                    className={`w-full cursor-pointer rounded-xl border p-5 text-left transition-colors ${
                      active
                        ? 'border-[#9A3412] bg-white ring-1 ring-[#9A3412]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-base font-semibold text-stone-900">
                          {menu.name}
                        </h3>
                        <p className="mt-1 text-sm text-stone-600">{menu.detail}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono-num text-base font-bold text-[#9A3412]">
                          KSh {menu.pricePerPlate}
                        </span>
                        <span className="block text-xs text-stone-500">per plate</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div id="caterer-quote" className="lg:col-span-5">
            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <h3 className="font-display text-xl font-bold text-stone-900">
                Event Cost Calculator
              </h3>
              <p className="mt-1 text-xs text-stone-500">{selectedMenu.name}</p>

              <div className="mt-5">
                <label htmlFor="guest-count" className="block text-xs font-medium text-stone-700">
                  Number of guests / plates
                </label>
                <div className="mt-1.5 flex items-center gap-3">
                  <motion.button
                    type="button"
                    whileTap={SQUASH_TAP}
                    aria-label="Decrease guest count"
                    onClick={() => setGuests((g) => Math.max(10, g - 5))}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>
                  <input
                    id="guest-count"
                    type="number"
                    min={10}
                    max={500}
                    value={guests}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!Number.isNaN(val)) {
                        setGuests(Math.max(10, Math.min(500, val)));
                      }
                    }}
                    className="font-mono-num min-h-[44px] w-24 rounded-lg border border-stone-300 px-3 py-2 text-center text-base font-semibold text-stone-900"
                  />
                  <motion.button
                    type="button"
                    whileTap={SQUASH_TAP}
                    aria-label="Increase guest count"
                    onClick={() => setGuests((g) => Math.min(500, g + 5))}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <label className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm">
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeJuice}
                      onChange={(e) => setIncludeJuice(e.target.checked)}
                      className="h-4 w-4 accent-[#9A3412]"
                    />
                    <span>Fresh Passion / Mango Juice</span>
                  </span>
                  <span className="font-mono-num text-xs font-medium text-stone-600">
                    +KSh 120 / guest
                  </span>
                </label>

                <label className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm">
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeChafers}
                      onChange={(e) => setIncludeChafers(e.target.checked)}
                      className="h-4 w-4 accent-[#9A3412]"
                    />
                    <span>Chafing dishes & serving staff</span>
                  </span>
                  <span className="font-mono-num text-xs font-medium text-stone-600">
                    +KSh 3,500
                  </span>
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="event-date" className="block text-xs font-medium text-stone-700">
                    Event date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
                  />
                </div>
                <div>
                  <label htmlFor="event-area" className="block text-xs font-medium text-stone-700">
                    Delivery area
                  </label>
                  <select
                    id="event-area"
                    value={eventArea}
                    onChange={(e) => setEventArea(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
                  >
                    <option>Nairobi (Kilimani / Westlands / CBD)</option>
                    <option>Karen / Langata</option>
                    <option>Thika Road / Kasarani</option>
                    <option>Kiambu / Ruaka</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-stone-50 p-4">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>
                    Food ({guests} × KSh {selectedMenu.pricePerPlate})
                  </span>
                  <span className="font-mono-num">KSh {foodSubtotal.toLocaleString()}</span>
                </div>
                {includeJuice && (
                  <div className="mt-1 flex items-center justify-between text-xs text-stone-600">
                    <span>Fresh juice ({guests} × KSh 120)</span>
                    <span className="font-mono-num">KSh {juiceTotal.toLocaleString()}</span>
                  </div>
                )}
                {includeChafers && (
                  <div className="mt-1 flex items-center justify-between text-xs text-stone-600">
                    <span>Chafing dishes & servers</span>
                    <span className="font-mono-num">KSh {chaferTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-2.5">
                  <span className="text-sm font-semibold text-stone-900">Estimated Total</span>
                  <span className="font-mono-num text-lg font-bold text-[#9A3412]">
                    KSh {estimatedTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <motion.a
                whileHover={ANTICIPATION_HOVER}
                whileTap={SQUASH_TAP}
                href={`https://wa.me/?text=${encodeURIComponent(whatsappOrder)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#0F5C43] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4734]"
              >
                <MessageCircle className="h-4 w-4" />
                Send Quote on WhatsApp
              </motion.a>

              <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
                <div>
                  <p className="text-xs text-stone-500">Deposit via M-Pesa Till</p>
                  <p className="font-mono-num text-base font-bold text-stone-900">884 1203</p>
                </div>
                <motion.button
                  type="button"
                  whileTap={SQUASH_TAP}
                  onClick={handleCopyTill}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg border border-stone-300 px-3.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-50"
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
        </section>

        <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#9A3412]" />
            <div>
              <h3 className="font-display text-sm font-semibold text-stone-900">
                Kitchen Dispatch · Nairobi
              </h3>
              <p className="mt-0.5 text-sm text-stone-600">
                Deliveries across Nairobi, Ruaka, and Kiambu · Book at least 24 hours ahead for groups over 25.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
