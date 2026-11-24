import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigateSection: (sectionId: string) => void;
}

export function Navbar({ onNavigateSection }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (sectionId: string) => {
    setMobileOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('top');
          }}
          className="font-display flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F5C43]"
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
          <span>summit</span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"
        >
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('services');
            }}
            className="whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4"
          >
            Services
          </a>
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('pricing');
            }}
            className="whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4"
          >
            Pricing
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('contact');
            }}
            className="whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4"
          >
            Contact
          </a>
        </nav>

        {/* Zone 3: Single primary action + mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('contact');
            }}
            className="hidden rounded-lg bg-[#0F5C43] px-4 py-2 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#0B4734] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C43] md:inline-flex"
          >
            Message me
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {[
              { id: 'services', label: 'Services' },
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
                className="flex min-h-[44px] items-center rounded-md px-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('contact');
              }}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-[#0F5C43] px-4 py-2.5 text-base font-medium text-white hover:bg-[#0B4734]"
            >
              Message me
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
