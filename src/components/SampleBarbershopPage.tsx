import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Copy, MapPin, Clock, MessageCircle } from 'lucide-react';
import { ANTICIPATION_HOVER, SQUASH_TAP } from '../lib/motionPresets';

interface SampleBarbershopPageProps {
  onBack: () => void;
}

const CUT_MENU = [
  { id: 'fade', name: 'Clean Skin Fade & Line-up', time: '35 mins', price: 500 },
  { id: 'exec', name: 'Executive Cut, Beard Trim & Wash', time: '50 mins', price: 800 },
  { id: 'beard', name: 'Beard Sculpt & Hot Towel Shave', time: '25 mins', price: 400 },
  { id: 'dye', name: 'Cut & Black Beard / Hair Enhancer', time: '45 mins', price: 700 },
  { id: 'kids', name: 'Kids Haircut (Under 12)', time: '25 mins', price: 350 },
];

const TIME_SLOTS = [
  'Today · 1:30 PM',
  'Today · 3:00 PM',
  'Today · 5:15 PM',
  'Tomorrow · 9:30 AM',
  'Tomorrow · 11:00 AM',
  'Saturday · 10:00 AM',
];

export function SampleBarbershopPage({ onBack }: SampleBarbershopPageProps) {
  const [selectedCutId, setSelectedCutId] = useState('exec');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [barber, setBarber] = useState('Brian (Senior Barber)');
  const [copiedTill, setCopiedTill] = useState(false);

  const selectedCut = CUT_MENU.find((c) => c.id === selectedCutId) || CUT_MENU[0];

  const handleCopyTill = async () => {
    try {
      await navigator.clipboard.writeText('7120945');
    } catch {
      // Ignore clipboard failure
    }
    setCopiedTill(true);
    setTimeout(() => setCopiedTill(false), 2200);
  };

  const whatsappText = `Hi Kicks & Clips Westlands, I'd like to book ${selectedCut.name} (KSh ${selectedCut.price}) for ${selectedSlot} with ${barber}.`;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100">
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
          <span className="text-zinc-400">
            Sample project built by Emmanuel Nthiga · Local Barbershop Demo
          </span>
        </div>
      </div>

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <span className="font-display text-lg font-bold tracking-tight text-zinc-900 whitespace-nowrap">
            Kicks & Clips
          </span>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 sm:flex">
            <a href="#barber-menu" className="hover:text-zinc-900">
              Cuts & Prices
            </a>
            <a href="#barber-reserve" className="hover:text-zinc-900">
              Reserve Chair
            </a>
            <a href="#barber-location" className="hover:text-zinc-900">
              Westlands Map
            </a>
          </nav>
          <motion.a
            whileHover={ANTICIPATION_HOVER}
            whileTap={SQUASH_TAP}
            href="#barber-reserve"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white whitespace-nowrap transition-colors hover:bg-zinc-800"
          >
            Book a chair
          </motion.a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <section className="grid items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-medium text-[#B45309]">
              Westlands, Nairobi · Mpaka Road, Ground Floor
            </p>
            <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl text-balance">
              Sharp fades, clean beard work, zero queue waiting.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
              Pick your haircut and time slot below so your barber is ready when you walk in. Pay via M-Pesa Till at the counter.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <motion.a
                whileHover={ANTICIPATION_HOVER}
                whileTap={SQUASH_TAP}
                href="#barber-reserve"
                className="inline-flex min-h-[48px] items-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Reserve your time slot
              </motion.a>
              <a
                href="https://maps.google.com/?q=Mpaka+Road+Westlands+Nairobi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                <MapPin className="h-4 w-4 text-[#B45309]" />
                Find us in Westlands
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200">
              <img
                src="/src/assets/images/demo_barbershop_1795541847917.jpg"
                alt="Kicks and Clips barbershop interior in Westlands Nairobi"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section id="barber-menu" className="mt-14 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-2xl font-bold text-zinc-900">1. Pick your cut</h2>
            <p className="mt-1 text-sm text-zinc-600">Clear pricing before you sit in the chair.</p>

            <div className="mt-4 space-y-2.5">
              {CUT_MENU.map((cut) => {
                const active = cut.id === selectedCutId;
                return (
                  <motion.button
                    key={cut.id}
                    type="button"
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedCutId(cut.id)}
                    className={`flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${
                      active
                        ? 'border-zinc-900 bg-white ring-1 ring-zinc-900'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{cut.name}</p>
                      <p className="text-xs text-zinc-500">{cut.time}</p>
                    </div>
                    <span className="font-mono-num text-sm font-bold text-zinc-900 whitespace-nowrap">
                      KSh {cut.price.toLocaleString()}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div id="barber-reserve" className="lg:col-span-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h2 className="font-display text-2xl font-bold text-zinc-900">
                2. Pick time & barber
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Selected: <span className="font-semibold text-zinc-900">{selectedCut.name}</span> ·{' '}
                <span className="font-mono-num font-semibold text-zinc-900">
                  KSh {selectedCut.price}
                </span>
              </p>

              <div className="mt-5">
                <p className="text-xs font-medium text-zinc-700">Available times</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIME_SLOTS.map((slot) => (
                    <motion.button
                      key={slot}
                      type="button"
                      whileTap={SQUASH_TAP}
                      onClick={() => setSelectedSlot(slot)}
                      className={`min-h-[42px] cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                        selectedSlot === slot
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {slot}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="barber-select" className="block text-xs font-medium text-zinc-700">
                  Preferred barber
                </label>
                <select
                  id="barber-select"
                  value={barber}
                  onChange={(e) => setBarber(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  <option>Brian (Senior Barber)</option>
                  <option>Kevin (Fades & Beard)</option>
                  <option>Dennis (Any Cut)</option>
                </select>
              </div>

              <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
                <span className="font-semibold text-zinc-900">WhatsApp message:</span> {whatsappText}
              </div>

              <motion.a
                whileHover={ANTICIPATION_HOVER}
                whileTap={SQUASH_TAP}
                href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#0F5C43] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4734]"
              >
                <MessageCircle className="h-4 w-4" />
                Reserve Chair on WhatsApp
              </motion.a>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4">
                <div>
                  <p className="text-xs text-zinc-500">M-Pesa Buy Goods Till</p>
                  <p className="font-mono-num text-base font-bold text-zinc-900">712 0945</p>
                </div>
                <motion.button
                  type="button"
                  whileTap={SQUASH_TAP}
                  onClick={handleCopyTill}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 px-3.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
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

        <section
          id="barber-location"
          className="mt-12 grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-2"
        >
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" />
            <div>
              <h3 className="font-display text-sm font-semibold text-zinc-900">Shop Address</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Mpaka Road, Westlands (opposite Naivas entrance), Nairobi
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" />
            <div>
              <h3 className="font-display text-sm font-semibold text-zinc-900">Open Daily</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Monday – Saturday: 8:00 AM – 8:30 PM · Sunday: 10:00 AM – 6:30 PM
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
