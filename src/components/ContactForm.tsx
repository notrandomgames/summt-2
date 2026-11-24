import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Check, MessageCircle, MessageSquare, Phone, Plus } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CONTACT_INFO, getWhatsAppUrl } from '../data/samples';
import {
  buildPreview,
  createMessageId,
  createThreadToken,
  loadSavedClientThreads,
  saveClientThreadRef,
  type SavedClientThreadRef,
} from '../lib/threads';
import { ThreadConversation } from './ThreadConversation';
import {
  ANTICIPATION_HOVER,
  EASE_SLOW_IN_OUT,
  SPRING_EXAGGERATED,
  SPRING_SNAPPY,
  SQUASH_TAP,
} from '../lib/motionPresets';

interface SavedInquiry {
  name: string;
  contact: string;
  businessType: string;
  packageChoice: string;
  message: string;
  threadId: string;
}

export const PACKAGE_OPTIONS = [
  'Starter Page (From KSh 200)',
  'Full Local Business Site (From KSh 300)',
  'Custom Order & Booking Site (From KSh 500)',
  'Not sure yet — help me choose',
] as const;

interface ContactFormProps {
  selectedPackage?: string;
  initialThreadId?: string | null;
  onSavedThreadsChange?: (threads: SavedClientThreadRef[]) => void;
}

function createInquiryId(): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `inq_${Date.now().toString(36)}_${randomPart}`;
}

/**
 * Postel's Law: Be liberal in what we accept.
 * Accepts Kenyan phone numbers with spaces, dashes, 07xx, 01xx, +254, 254,
 * or standard email addresses, and normalizes them cleanly.
 */
function normalizeContactInput(raw: string): { valid: boolean; normalized: string; hint?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: false, normalized: '', hint: 'Enter a WhatsApp number or email.' };

  if (trimmed.includes('@')) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
    return emailOk
      ? { valid: true, normalized: trimmed.toLowerCase(), hint: 'Email detected' }
      : { valid: false, normalized: trimmed, hint: 'Check email format (e.g. name@gmail.com).' };
  }

  const digitsOnly = trimmed.replace(/[\s\-()]/g, '');
  if (/^\+?254[17]\d{8}$/.test(digitsOnly)) {
    const clean = digitsOnly.startsWith('+') ? digitsOnly : `+${digitsOnly}`;
    return { valid: true, normalized: clean, hint: 'Kenyan WhatsApp / phone number' };
  }
  if (/^0[17]\d{8}$/.test(digitsOnly)) {
    return {
      valid: true,
      normalized: `+254${digitsOnly.slice(1)}`,
      hint: 'Kenyan WhatsApp / phone number',
    };
  }
  if (trimmed.length >= 7) {
    return { valid: true, normalized: trimmed };
  }
  return {
    valid: false,
    normalized: trimmed,
    hint: 'Use e.g. 0712 345 678, +254 712 345 678, or an email.',
  };
}

export function ContactForm({
  selectedPackage,
  initialThreadId,
  onSavedThreadsChange,
}: ContactFormProps) {
  const [savedThreads, setSavedThreads] = useState<SavedClientThreadRef[]>(() =>
    loadSavedClientThreads()
  );
  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => {
    if (initialThreadId) return initialThreadId;
    const existing = loadSavedClientThreads();
    return existing.length > 0 ? existing[0].threadId : null;
  });
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [packageChoice, setPackageChoice] = useState<string>(
    selectedPackage && PACKAGE_OPTIONS.includes(selectedPackage as (typeof PACKAGE_OPTIONS)[number])
      ? selectedPackage
      : PACKAGE_OPTIONS[0]
  );
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<SavedInquiry | null>(null);
  const [submitPressed, setSubmitPressed] = useState(false);

  useEffect(() => {
    if (
      selectedPackage &&
      PACKAGE_OPTIONS.includes(selectedPackage as (typeof PACKAGE_OPTIONS)[number])
    ) {
      setPackageChoice(selectedPackage);
      // If user clicked a pricing tier button, switch to the form so they can send a message for it
      setActiveThreadId(null);
    }
  }, [selectedPackage]);

  useEffect(() => {
    if (initialThreadId) {
      setActiveThreadId(initialThreadId);
    }
  }, [initialThreadId]);

  const contactStatus = contact.trim() ? normalizeContactInput(contact) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim().slice(0, 100);
    const contactCheck = normalizeContactInput(contact);
    const trimmedContact = contactCheck.normalized.slice(0, 120);
    const trimmedBusiness = (businessType.trim() || 'Local business').slice(0, 120);
    const trimmedMessage = message.trim().slice(0, 1500);

    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (!contactCheck.valid || trimmedContact.length < 5) {
      setErrorMsg(
        contactCheck.hint || 'Please enter your WhatsApp number or email address so I can reply.'
      );
      return;
    }
    if (trimmedMessage.length < 6) {
      setErrorMsg('Tell me a little about your business or what you need on the website.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    const inquiryId = createInquiryId();
    const threadId = createThreadToken();
    const initialMsgId = createMessageId('0_init');
    const path = `inquiries/${inquiryId}`;

    const inquiryData: SavedInquiry = {
      name: trimmedName,
      contact: trimmedContact,
      businessType: trimmedBusiness,
      packageChoice,
      message: trimmedMessage,
      threadId,
    };

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'inquiries', inquiryId), {
        name: trimmedName,
        contact: trimmedContact,
        businessType: trimmedBusiness,
        packageChoice,
        message: trimmedMessage,
        threadId,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'threads', threadId), {
        inquiryId,
        clientName: trimmedName,
        businessType: trimmedBusiness,
        packageChoice,
        status: 'new',
        lastMessagePreview: buildPreview(trimmedMessage),
        lastMessageBy: 'client',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'threads', threadId, 'messages', initialMsgId), {
        threadId,
        senderRole: 'client',
        senderName: trimmedName,
        body: trimmedMessage,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      const nextSaved = saveClientThreadRef({
        threadId,
        clientName: trimmedName,
        businessType: trimmedBusiness,
        savedAt: Date.now(),
      });
      setSavedThreads(nextSaved);
      onSavedThreadsChange?.(nextSaved);
      setLastSubmitted(inquiryData);
      setActiveThreadId(threadId);
      setName('');
      setContact('');
      setBusinessType('');
      setMessage('');
    } catch (error) {
      setErrorMsg(
        `Could not save your message right now. Please message me on WhatsApp or call ${CONTACT_INFO.phoneDisplay}.`
      );
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch {
        // Logged by handleFirestoreError and surfaced cleanly in inline error state
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeSavedMeta = savedThreads.find((t) => t.threadId === activeThreadId) ?? null;

  return (
    <div className="space-y-4">
      {savedThreads.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <MessageSquare className="h-3.5 w-3.5 text-[#0F5C43]" />
              Your saved messages:
            </span>
            {savedThreads.map((item) => {
              const isSelected = activeThreadId === item.threadId;
              return (
                <button
                  key={item.threadId}
                  type="button"
                  onClick={() => setActiveThreadId(item.threadId)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#0F5C43] text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.businessType}
                </button>
              );
            })}
          </div>

          {activeThreadId !== null && (
            <button
              type="button"
              onClick={() => setActiveThreadId(null)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              New inquiry
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeThreadId ? (
          <motion.div
            key={`thread-${activeThreadId}`}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={SPRING_EXAGGERATED}
          >
            <ThreadConversation
              threadId={activeThreadId}
              fallbackClientName={
                lastSubmitted?.threadId === activeThreadId
                  ? lastSubmitted.name
                  : activeSavedMeta?.clientName
              }
              fallbackBusinessType={
                lastSubmitted?.threadId === activeThreadId
                  ? lastSubmitted.businessType
                  : activeSavedMeta?.businessType
              }
              fallbackPackageChoice={
                lastSubmitted?.threadId === activeThreadId ? lastSubmitted.packageChoice : undefined
              }
              onStartNewInquiry={() => setActiveThreadId(null)}
            />
          </motion.div>
        ) : (
          <motion.form
          key="inquiry-form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: EASE_SLOW_IN_OUT }}
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          {/* Chunk 1: Who you are */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-slate-800">
                Your name
              </label>
              <input
                id="contact-name"
                type="text"
                maxLength={100}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Grace Muthoni"
                required
                className="mt-1.5 min-h-[48px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="contact-info" className="block text-sm font-medium text-slate-800">
                  WhatsApp number or email
                </label>
                {contactStatus?.valid && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0F5C43]">
                    <Check className="h-3.5 w-3.5" />
                    {contactStatus.hint || 'Ready'}
                  </span>
                )}
              </div>
              <input
                id="contact-info"
                type="text"
                maxLength={120}
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="0712 345 678, +254..., or email"
                required
                className="mt-1.5 min-h-[48px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
              />
            </div>
          </div>

          {/* Chunk 2: Your business & package (easy Fitts choice buttons + select fallback) */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="business-type" className="block text-sm font-medium text-slate-800">
                Type of business
              </label>
              <input
                id="business-type"
                type="text"
                maxLength={120}
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g. Salon in Ruaka, Caterer, Hardware"
                className="mt-1.5 min-h-[48px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
              />
            </div>

            <div>
              <label htmlFor="package-choice" className="block text-sm font-medium text-slate-800">
                Package
              </label>
              <select
                id="package-choice"
                value={packageChoice}
                onChange={(e) => setPackageChoice(e.target.value)}
                className="mt-1.5 min-h-[48px] w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 transition-colors focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
              >
                {PACKAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chunk 3: Message */}
          <div className="mt-5">
            <label htmlFor="contact-message" className="block text-sm font-medium text-slate-800">
              What should be on your website?
            </label>
            <textarea
              id="contact-message"
              rows={4}
              maxLength={1500}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Tell me what you sell or offer, where your shop is located, and if you already have photos or a price list."
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
            />
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="mt-3 text-sm font-medium text-red-700"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <motion.button
                type="submit"
                disabled={submitting}
                onPointerDown={() => setSubmitPressed(true)}
                onPointerUp={() => setSubmitPressed(false)}
                onPointerLeave={() => setSubmitPressed(false)}
                whileHover={submitting ? undefined : ANTICIPATION_HOVER}
                whileTap={submitting ? undefined : SQUASH_TAP}
                animate={submitPressed ? { scaleX: 1.03, scaleY: 0.95 } : { scaleX: 1, scaleY: 1 }}
                transition={SPRING_SNAPPY}
                className="inline-flex min-h-[50px] w-full cursor-pointer items-center justify-center rounded-lg bg-[#0F5C43] px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-[#0B4734] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C43] sm:w-auto"
              >
                {submitting ? 'Sending...' : 'Send message to Emman'}
              </motion.button>

              <motion.a
                whileHover={ANTICIPATION_HOVER}
                whileTap={SQUASH_TAP}
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 text-[#0F5C43]" />
                WhatsApp me directly
              </motion.a>
            </div>

            <a
              href={CONTACT_INFO.phoneHref}
              className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              <Phone className="h-4 w-4 text-[#0F5C43]" />
              <span className="font-mono-num">{CONTACT_INFO.phoneDisplay}</span>
            </a>
          </div>
        </motion.form>
      )}
      </AnimatePresence>
    </div>
  );
}
