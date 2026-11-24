import { useState, type MouseEvent } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Clock, MapPin, MessageCircle, Smartphone } from 'lucide-react';
import {
  EASE_SLOW_IN_OUT,
  SPRING_SNAPPY,
  SQUASH_TAP,
} from '../lib/motionPresets';

type PreviewPreset = 'salon' | 'barber' | 'shop';

const PRESETS: Record<
  PreviewPreset,
  {
    label: string;
    businessName: string;
    location: string;
    hours: string;
    menuSample: { name: string; price: string }[];
  }
> = {
  salon: {
    label: 'Salon',
    businessName: 'Your Salon Page',
    location: 'Kilimani · Google Maps linked',
    hours: 'Tue – Sun · 8:30 AM – 7:30 PM',
    menuSample: [
      { name: 'Medium Knotless Braids', price: 'KSh 2,500' },
      { name: 'Wash & Silk Press', price: 'KSh 1,800' },
      { name: 'Gel Manicure', price: 'KSh 1,000' },
    ],
  },
  barber: {
    label: 'Barbershop',
    businessName: 'Your Barbershop Page',
    location: 'Westlands · Google Maps linked',
    hours: 'Daily · 8:00 AM – 8:30 PM',
    menuSample: [
      { name: 'Skin Fade & Line-up', price: 'KSh 500' },
      { name: 'Cut & Beard Trim', price: 'KSh 800' },
      { name: 'Kids Cut', price: 'KSh 350' },
    ],
  },
  shop: {
    label: 'Food & Shop',
    businessName: 'Your Food or Shop Page',
    location: 'Nairobi · Google Maps linked',
    hours: 'Mon – Sat · 9:00 AM – 8:00 PM',
    menuSample: [
      { name: 'Beef Pilau Plate', price: 'KSh 450' },
      { name: 'Office Lunch Box', price: 'KSh 550' },
      { name: 'Family Platter', price: 'KSh 2,200' },
    ],
  },
};

interface HeroPreviewCardProps {
  onStartWebsite: () => void;
}

export function HeroPreviewCard({ onStartWebsite }: HeroPreviewCardProps) {
  const [activePreset, setActivePreset] = useState<PreviewPreset>('salon');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 24 });
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-4.5, 4.5]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4.5, -4.5]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const preset = PRESETS[activePreset];

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformPerspective: 1000,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-500">
            Preview what customers see
          </p>

          <div
            role="group"
            aria-label="Preview business type"
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            {(['salon', 'barber', 'shop'] as const).map((key) => {
              const isSelected = activePreset === key;
              return (
                <motion.button
                  key={key}
                  type="button"
                  whileTap={SQUASH_TAP}
                  onClick={() => setActivePreset(key)}
                  className={`relative cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    isSelected ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="hero-preset-bg"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 rounded-md bg-white shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{PRESETS[key].label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePreset}
            initial={{ opacity: 0, x: 10, y: 6, rotate: 0.5 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -10, y: -4, rotate: -0.5 }}
            transition={{ duration: 0.2, ease: EASE_SLOW_IN_OUT }}
            className="mt-4"
          >
            <h2 className="font-display text-xl font-bold text-slate-900">
              {preset.businessName}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-[#0F5C43]" />
              {preset.location}
            </p>

            <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200/80 bg-slate-50/70 px-4 text-sm">
              {preset.menuSample.map((item, idx) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -6, y: 4 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{
                    duration: 0.22,
                    delay: idx * 0.04,
                    ease: EASE_SLOW_IN_OUT,
                  }}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="text-slate-700">{item.name}</span>
                  <span className="font-mono-num font-semibold text-slate-900 whitespace-nowrap">
                    {item.price}
                  </span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-white px-4 py-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                <Clock className="h-3.5 w-3.5 text-[#0F5C43]" />
                Opening hours
              </span>
              <span className="text-slate-600">{preset.hours}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Smartphone className="h-3.5 w-3.5 text-[#0F5C43]" />
          Built for mobile data
        </span>
        <motion.button
          type="button"
          whileHover={{ x: 2 }}
          whileTap={SQUASH_TAP}
          onClick={onStartWebsite}
          className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg bg-[#0F5C43]/10 px-3.5 py-2 text-xs font-semibold text-[#0F5C43] transition-colors hover:bg-[#0F5C43]/15"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Request a page like this
        </motion.button>
      </div>
    </motion.div>
  );
}
