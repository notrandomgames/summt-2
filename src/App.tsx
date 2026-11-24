/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ArrowRight,
  Check,
  MapPin,
  MessageCircle,
  Smartphone,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ContactForm } from './components/ContactForm';
import { PRICING_TIERS, SERVICES } from './data/samples';

export default function App() {
  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar onNavigateSection={handleNavigateSection} />

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-12 sm:px-6 lg:pt-20 lg:pb-16">
          <div className="grid items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-7">
              <p className="text-sm font-medium text-[#0F5C43]">
                Nairobi, Kenya · Web design by Emmanuel Nthiga
              </p>
              <h1 className="font-display mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.12] tracking-tight text-slate-900 text-balance">
                I build simple websites so customers find your business on Google and WhatsApp you.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Whether you run a salon, barbershop, food business, or retail shop, customers check their phones before they visit. I put your KSh prices, Google Maps pin, and direct WhatsApp button on one clean page — starting from KSh 200.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigateSection('contact');
                  }}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#0F5C43] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B4734] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C43]"
                >
                  Start your website
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigateSection('pricing');
                  }}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
                >
                  View pricing (from KSh 200)
                </a>
              </div>
            </div>

            {/* Right column: Concrete preview of what a local business gets */}
            <div className="lg:col-span-5">
              <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 sm:p-7">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    What goes on your business page
                  </p>
                  <h2 className="font-display mt-1.5 text-xl font-bold text-slate-900">
                    Everything a customer needs before visiting or ordering
                  </h2>

                  <ul className="mt-5 divide-y divide-slate-100 text-sm">
                    <li className="flex items-start gap-3 py-3">
                      <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-[#0F5C43]" />
                      <div>
                        <p className="font-medium text-slate-900">Clear KSh service & price list</p>
                        <p className="text-slate-600">
                          Customers see your exact prices without having to DM "how much?".
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 py-3">
                      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#0F5C43]" />
                      <div>
                        <p className="font-medium text-slate-900">One-tap WhatsApp booking</p>
                        <p className="text-slate-600">
                          Opens a ready-to-send message straight to your WhatsApp number.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 py-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0F5C43]" />
                      <div>
                        <p className="font-medium text-slate-900">Google Maps & M-Pesa Till</p>
                        <p className="text-slate-600">
                          Directions straight to your shop and a Till number customers can copy.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>Built to load fast on mobile data</span>
                  <span className="font-mono-num font-semibold text-slate-900">From KSh 200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Factual baseline strip */}
          <div className="mt-12 grid gap-4 border-y border-slate-200 py-6 sm:grid-cols-3">
            <div>
              <p className="font-mono-num text-base font-semibold text-slate-900">
                Starting from KSh 200
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Clear price agreed upfront before I start building.
              </p>
            </div>
            <div>
              <p className="font-display text-base font-semibold text-slate-900">
                Built for Kenyan phones
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Clean pages that open quickly even on normal mobile bundles.
              </p>
            </div>
            <div>
              <p className="font-display text-base font-semibold text-slate-900">
                You talk directly to me
              </p>
              <p className="mt-1 text-sm text-slate-600">
                No agency middlemen — message me anytime for updates.
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              What I build for local businesses
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Practical features that help people find your shop, check your prices, and contact you without friction.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {SERVICES.map((service) => (
              <article
                key={service.number}
                className="rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300"
              >
                <p className="font-mono-num text-xs font-semibold text-[#0F5C43]">
                  {service.number}
                </p>
                <h3 className="font-display mt-2 text-lg font-semibold text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Clear pricing, starting from KSh 200
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Start small with a clean WhatsApp & price page, or go for a full website as your business grows.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`flex flex-col justify-between rounded-xl border bg-slate-50/50 p-6 ${
                    tier.recommended
                      ? 'border-[#0F5C43] bg-white ring-1 ring-[#0F5C43]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-bold text-slate-900">{tier.name}</h3>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{tier.timeline}</span>
                    </div>
                    <p className="font-mono-num mt-3 text-2xl font-bold text-[#0F5C43]">
                      {tier.price}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{tier.description}</p>

                    <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-sm text-slate-700">
                      {tier.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F5C43]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateSection('contact');
                    }}
                    className={`mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                      tier.recommended
                        ? 'bg-[#0F5C43] text-white hover:bg-[#0B4734]'
                        : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Ask about {tier.name}
                  </a>
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Note: A custom domain like <span className="font-medium text-slate-700">yourshop.co.ke</span> is optional and billed separately at standard registrar cost if you want one. Behind the scenes, I handle hosting, fast mobile loading, and contact forms so you never have to worry about code.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="border-t border-slate-200 bg-slate-100/70 py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Tell me about your business
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Share what you do and what you need on your website. I reply personally within the day.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="font-display font-semibold text-slate-900">
              Summit · Emmanuel Nthiga
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Simple websites for Kenyan businesses · Nairobi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm">
            <a
              href="mailto:emmannthiga25@gmail.com"
              className="hover:text-slate-900 hover:underline underline-offset-4"
            >
              emmannthiga25@gmail.com
            </a>
            <a
              href="https://instagram.com/summit._digital"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 hover:underline underline-offset-4"
            >
              @summit._digital
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
