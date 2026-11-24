/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { ArrowRight, Check, ExternalLink, MessageCircle, Phone } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroPreviewCard } from './components/HeroPreviewCard';
import { ContactForm, PACKAGE_OPTIONS } from './components/ContactForm';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OwnerInbox } from './components/OwnerInbox';
import { SampleSalonPage } from './components/SampleSalonPage';
import { SampleBarbershopPage } from './components/SampleBarbershopPage';
import { SampleCatererPage } from './components/SampleCatererPage';
import {
  CONTACT_INFO,
  getWhatsAppUrl,
  PRICING_TIERS,
  SAMPLE_PROJECTS,
  SERVICES,
  type SampleSlug,
} from './data/samples';
import {
  ANTICIPATION_HOVER,
  ARC_ITEM,
  EASE_SLOW_IN_OUT,
  SPRING_EXAGGERATED,
  SPRING_SNAPPY,
  SQUASH_TAP,
  STAGGER_CONTAINER,
} from './lib/motionPresets';
import './lib/firebase';

const TIER_TO_PACKAGE: Record<string, string> = {
  'Starter Page': PACKAGE_OPTIONS[0],
  'Full Local Business Site': PACKAGE_OPTIONS[1],
  'Custom Order & Booking Site': PACKAGE_OPTIONS[2],
};

function parseDemoFromHash(hash: string): SampleSlug | null {
  if (hash === '#/demo/salon') return 'salon';
  if (hash === '#/demo/barbershop') return 'barbershop';
  if (hash === '#/demo/caterer') return 'caterer';
  return null;
}

export default function App() {
  const [showInbox, setShowInbox] = useState(() => window.location.hash === '#/inbox');
  const [activeSample, setActiveSample] = useState<SampleSlug | null>(() =>
    parseDemoFromHash(window.location.hash)
  );
  const [workFilter, setWorkFilter] = useState<'all' | 'beauty' | 'food'>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [selectedPackage, setSelectedPackage] = useState<string>(PACKAGE_OPTIONS[0]);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setShowInbox(window.location.hash === '#/inbox');
      const nextSample = parseDemoFromHash(window.location.hash);
      setActiveSample(nextSample);
      if (nextSample) {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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

  const handleSelectPackage = (tierName: string) => {
    const mapped = TIER_TO_PACKAGE[tierName] ?? PACKAGE_OPTIONS[0];
    setSelectedPackage(mapped);
    handleNavigateSection('contact');
  };

  const openSample = (slug: SampleSlug) => {
    window.location.hash = `#/demo/${slug}`;
    setActiveSample(slug);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const closeSample = () => {
    window.location.hash = '#work';
    setActiveSample(null);
    setTimeout(() => {
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const openInbox = () => {
    window.location.hash = '#/inbox';
    setShowInbox(true);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const closeInbox = () => {
    window.location.hash = '';
    setShowInbox(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const visibleSamples =
    workFilter === 'all'
      ? SAMPLE_PROJECTS
      : SAMPLE_PROJECTS.filter((project) => project.category === workFilter);

  const renderPage = () => {
    if (showInbox) return <OwnerInbox onBack={closeInbox} />;
    if (activeSample === 'salon') return <SampleSalonPage onBack={closeSample} />;
    if (activeSample === 'barbershop') return <SampleBarbershopPage onBack={closeSample} />;
    if (activeSample === 'caterer') return <SampleCatererPage onBack={closeSample} />;

    return (
      <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar onNavigateSection={handleNavigateSection} />

        <main>
          {/* Hero Section */}
          <section className="mx-auto max-w-6xl px-4 pt-12 pb-12 sm:px-6 lg:pt-20 lg:pb-16">
            <div className="grid items-stretch gap-10 lg:grid-cols-12">
              <motion.div
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="visible"
                className="flex flex-col justify-center lg:col-span-7"
              >
                <motion.p variants={ARC_ITEM} className="text-sm font-medium text-[#0F5C43]">
                  {CONTACT_INFO.city} · Built by {CONTACT_INFO.ownerName}
                </motion.p>
                <motion.h1
                  variants={ARC_ITEM}
                  className="font-display mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.12] tracking-tight text-slate-900 text-balance"
                >
                  I build simple websites so customers find your business on Google and WhatsApp you.
                </motion.h1>
                <motion.p
                  variants={ARC_ITEM}
                  className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
                >
                  Whether you run a salon, barbershop, food business, or retail shop, customers check their phones before they visit. I put your KSh prices, Google Maps pin, and direct WhatsApp button on one clean page — starting from KSh 200.
                </motion.p>

                {/* Primary WhatsApp CTA + Phone + Pricing */}
                <motion.div
                  variants={ARC_ITEM}
                  className="mt-7 flex flex-wrap items-center gap-3.5"
                >
                  <motion.a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={ANTICIPATION_HOVER}
                    whileTap={SQUASH_TAP}
                    className="group inline-flex min-h-[50px] items-center gap-2.5 rounded-lg bg-[#0F5C43] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#0B4734] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C43]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Chat on WhatsApp</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                  </motion.a>

                  <motion.a
                    href={CONTACT_INFO.phoneHref}
                    whileHover={{ y: -1 }}
                    whileTap={SQUASH_TAP}
                    className="inline-flex min-h-[50px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100"
                  >
                    <Phone className="h-4 w-4 text-[#0F5C43]" />
                    <span className="font-mono-num">{CONTACT_INFO.phoneDisplay}</span>
                  </motion.a>
                </motion.div>

                <motion.div variants={ARC_ITEM} className="mt-4 flex flex-wrap items-center gap-5 text-sm">
                  <a
                    href="#work"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateSection('work');
                    }}
                    className="font-medium text-slate-700 underline underline-offset-4 hover:text-[#0F5C43]"
                  >
                    Try the 3 live sample sites
                  </a>
                  <a
                    href="#pricing"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateSection('pricing');
                    }}
                    className="font-medium text-slate-700 underline underline-offset-4 hover:text-[#0F5C43]"
                  >
                    See KSh prices
                  </a>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.12, ease: EASE_SLOW_IN_OUT }}
                className="lg:col-span-5"
              >
                <HeroPreviewCard onStartWebsite={() => handleNavigateSection('contact')} />
              </motion.div>
            </div>

            {/* Factual baseline strip (no fake stats) */}
            <motion.div
              variants={STAGGER_CONTAINER}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              className="mt-12 grid gap-4 border-y border-slate-200 py-6 sm:grid-cols-3"
            >
              <motion.div variants={ARC_ITEM}>
                <p className="font-mono-num text-base font-semibold text-slate-900">
                  Starting from KSh 200
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Clear price agreed upfront before I start building.
                </p>
              </motion.div>
              <motion.div variants={ARC_ITEM}>
                <p className="font-display text-base font-semibold text-slate-900">
                  Built for Kenyan phones
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Clean pages that open quickly even on normal mobile bundles.
                </p>
              </motion.div>
              <motion.div variants={ARC_ITEM}>
                <p className="font-display text-base font-semibold text-slate-900">
                  You talk directly to me
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Call or WhatsApp {CONTACT_INFO.phoneDisplay} anytime for updates.
                </p>
              </motion.div>
            </motion.div>
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

            <motion.div
              variants={STAGGER_CONTAINER}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-8 grid gap-6 md:grid-cols-2"
            >
              {SERVICES.map((service) => {
                const isFocused = hoveredService === service.number;
                const isDimmed = hoveredService !== null && !isFocused;
                return (
                  <motion.article
                    key={service.number}
                    variants={ARC_ITEM}
                    onMouseEnter={() => setHoveredService(service.number)}
                    onMouseLeave={() => setHoveredService(null)}
                    animate={{
                      y: isFocused ? -4 : 0,
                      opacity: isDimmed ? 0.68 : 1,
                    }}
                    transition={SPRING_SNAPPY}
                    className="rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-[#0F5C43]/50"
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
                  </motion.article>
                );
              })}
            </motion.div>
          </section>

          {/* Sample Work Section: 3 real working local demos clearly labeled Sample project */}
          <section id="work" className="border-y border-slate-200 bg-white py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Sample projects you can click through
                  </h2>
                  <p className="mt-2 text-base text-slate-600">
                    I built three working sample websites for local Kenyan businesses. Open any of them to test the price menus, calculators, and WhatsApp buttons yourself.
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Filter sample projects"
                  className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
                >
                  {(
                    [
                      { id: 'all', label: 'All samples' },
                      { id: 'beauty', label: 'Salon & Barber' },
                      { id: 'food', label: 'Food & Catering' },
                    ] as const
                  ).map((tab) => (
                    <motion.button
                      key={tab.id}
                      type="button"
                      whileTap={SQUASH_TAP}
                      onClick={() => setWorkFilter(tab.id)}
                      className={`min-h-[40px] cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        workFilter === tab.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div
                variants={STAGGER_CONTAINER}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                className="mt-8 grid gap-6 md:grid-cols-3"
              >
                {visibleSamples.map((project) => (
                  <motion.article
                    key={project.slug}
                    variants={ARC_ITEM}
                    whileHover={{ y: -4 }}
                    transition={SPRING_SNAPPY}
                    className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:border-slate-300"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden border-b border-slate-200 bg-slate-200">
                      {!failedImages[project.slug] ? (
                        <img
                          src={project.image}
                          alt={project.imageAlt}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [project.slug]: true }))
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 px-4 text-center text-sm font-medium text-slate-500">
                          {project.title}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {project.categoryLabel} · {project.location}
                        </p>
                        <h3 className="font-display mt-1.5 text-lg font-bold text-slate-900">
                          {project.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {project.summary}
                        </p>
                        <p className="mt-3 text-xs text-slate-500">
                          {project.includedFeatures.join(' · ')}
                        </p>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={ANTICIPATION_HOVER}
                        whileTap={SQUASH_TAP}
                        onClick={() => openSample(project.slug)}
                        className="mt-5 inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:border-[#0F5C43] hover:text-[#0F5C43]"
                      >
                        Open live sample
                        <ExternalLink className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Clear pricing, starting from KSh 200
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Start small with a clean WhatsApp & price page, or go for a full website as your business grows. Tap any package to pre-fill your message below.
              </p>
            </div>

            <motion.div
              variants={STAGGER_CONTAINER}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="mt-8 grid gap-6 lg:grid-cols-3"
            >
              {PRICING_TIERS.map((tier) => {
                const mappedPackage = TIER_TO_PACKAGE[tier.name];
                const isSelected = selectedPackage === mappedPackage;
                const isHovered = hoveredTier === tier.name;
                const isDimmed = hoveredTier !== null && !isHovered;

                return (
                  <motion.div
                    key={tier.name}
                    variants={ARC_ITEM}
                    onMouseEnter={() => setHoveredTier(tier.name)}
                    onMouseLeave={() => setHoveredTier(null)}
                    animate={{
                      y: isHovered ? -5 : 0,
                      scale: isSelected ? 1.01 : 1,
                      opacity: isDimmed ? 0.75 : 1,
                    }}
                    transition={SPRING_EXAGGERATED}
                    className={`flex flex-col justify-between rounded-xl border p-6 transition-colors ${
                      isSelected || tier.recommended
                        ? 'border-[#0F5C43] bg-white ring-1 ring-[#0F5C43]'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-display text-lg font-bold text-slate-900">
                          {tier.name}
                        </h3>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {tier.timeline}
                        </span>
                      </div>
                      <p className="font-mono-num mt-3 text-2xl font-bold text-[#0F5C43]">
                        {tier.price}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {tier.description}
                      </p>

                      <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-sm text-slate-700">
                        {tier.items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F5C43]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={ANTICIPATION_HOVER}
                      whileTap={SQUASH_TAP}
                      onClick={() => handleSelectPackage(tier.name)}
                      className={`mt-6 inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                        tier.recommended || isSelected
                          ? 'bg-[#0F5C43] text-white hover:bg-[#0B4734]'
                          : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? `Selected · Ask about ${tier.name}` : `Choose ${tier.name}`}
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>

            <p className="mt-5 text-sm text-slate-500">
              Note: A custom domain like{' '}
              <span className="font-medium text-slate-700">yourshop.co.ke</span> is optional and billed separately at standard registrar cost if you want one. Behind the scenes, I handle hosting, fast mobile loading, and contact forms so you never have to worry about code.
            </p>
          </section>

          {/* Contact Section */}
          <section id="contact" className="border-t border-slate-200 bg-slate-100/70 py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Tell me about your business
                  </h2>
                  <p className="mt-2 text-base text-slate-600">
                    Fill the quick form below, message me on WhatsApp, or call{' '}
                    <a
                      href={CONTACT_INFO.phoneHref}
                      className="font-mono-num font-semibold text-slate-900 underline underline-offset-4"
                    >
                      {CONTACT_INFO.phoneDisplay}
                    </a>
                    .
                  </p>
                </div>
              </div>
              <ContactForm selectedPackage={selectedPackage} />
            </div>
          </section>
        </main>

        {/* Quiet Footer */}
        <footer className="border-t border-slate-200 bg-white py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="font-display font-semibold text-slate-900">
                {CONTACT_INFO.brandName} · Built by {CONTACT_INFO.ownerName}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Simple websites for Kenyan businesses · {CONTACT_INFO.city}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-[#0F5C43] hover:underline underline-offset-4"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={CONTACT_INFO.phoneHref}
                className="font-mono-num inline-flex min-h-[44px] items-center hover:text-slate-900 hover:underline underline-offset-4"
              >
                {CONTACT_INFO.phoneDisplay}
              </a>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="inline-flex min-h-[44px] items-center hover:text-slate-900 hover:underline underline-offset-4"
              >
                {CONTACT_INFO.email}
              </a>
              <a
                href={CONTACT_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center hover:text-slate-900 hover:underline underline-offset-4"
              >
                {CONTACT_INFO.instagramHandle}
              </a>
              <button
                type="button"
                onClick={openInbox}
                className="inline-flex min-h-[44px] cursor-pointer items-center text-slate-500 hover:text-slate-900 hover:underline underline-offset-4"
              >
                Owner sign-in
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>{renderPage()}</ErrorBoundary>
    </MotionConfig>
  );
}
