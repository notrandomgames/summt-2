import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, MessageSquare, X } from 'lucide-react';
import { ANTICIPATION_HOVER, EASE_SLOW_IN_OUT, SQUASH_TAP } from '../lib/motionPresets';

interface NavbarProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenChat: () => void;
  savedChatCount?: number;
}

export function Navbar({ onNavigateSection, onOpenChat, savedChatCount = 0 }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (sectionId: string) => {
    setMobileOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        {/* Zone 1: Single-element brand wordmark */}
        <motion.a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('top');
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={SQUASH_TAP}
          className="font-display flex min-h-[44px] items-center gap-2.5 px-1 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F5C43]"
        >
          <svg
            className="h-6 w-6 shrink-0"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="8" cy="10" r="3.5" fill="#0F5C43" />
            <rect
              x="16.5"
              y="4.5"
              width="7"
              height="22"
              rx="3.5"
              transform="rotate(24 16.5 4.5)"
              fill="#0F5C43"
            />
          </svg>
          <span>summit digital</span>
        </motion.a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-2 text-sm font-medium text-slate-600 md:flex"
        >
          {[
            { id: 'services', label: 'Services' },
            { id: 'work', label: 'Samples' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'contact', label: 'Contact' },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="inline-flex min-h-[44px] items-center rounded-lg px-3.5 whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-slate-200/50 hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: My Chat + primary action + mobile menu toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <motion.button
            type="button"
            whileTap={SQUASH_TAP}
            onClick={onOpenChat}
            className="hidden min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 whitespace-nowrap shrink-0 transition-colors hover:border-[#0F5C43] hover:text-[#0F5C43] md:inline-flex"
          >
            <MessageSquare className="h-4 w-4 text-[#0F5C43]" />
            <span>My Chat</span>
            {savedChatCount > 0 && (
              <span className="font-mono-num rounded-md bg-[#0F5C43]/10 px-1.5 py-0.5 text-xs font-semibold text-[#0F5C43]">
                {savedChatCount}
              </span>
            )}
          </motion.button>

          <motion.a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('contact');
            }}
            whileHover={ANTICIPATION_HOVER}
            whileTap={SQUASH_TAP}
            className="hidden min-h-[44px] items-center rounded-lg bg-[#0F5C43] px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#0B4734] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C43] md:inline-flex"
          >
            Message me
          </motion.a>

          <motion.button
            type="button"
            whileTap={SQUASH_TAP}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: EASE_SLOW_IN_OUT }}
            className="border-t border-slate-200 bg-white px-4 py-4 md:hidden"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1.5">
              {[
                { id: 'services', label: 'Services' },
                { id: 'work', label: 'Samples' },
                { id: 'pricing', label: 'Pricing' },
                { id: 'contact', label: 'Contact' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.id);
                  }}
                  className="flex min-h-[48px] items-center rounded-lg px-3.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </a>
              ))}
              <motion.button
                type="button"
                whileTap={SQUASH_TAP}
                onClick={() => {
                  setMobileOpen(false);
                  onOpenChat();
                }}
                className="mt-2 flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50"
              >
                <MessageSquare className="h-4 w-4 text-[#0F5C43]" />
                <span>My Chat{savedChatCount > 0 ? ` (${savedChatCount})` : ''}</span>
              </motion.button>
              <motion.a
                whileTap={SQUASH_TAP}
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('contact');
                }}
                className="mt-1.5 flex min-h-[48px] items-center justify-center rounded-lg bg-[#0F5C43] px-4 py-3 text-base font-semibold text-white hover:bg-[#0B4734]"
              >
                Message me
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
