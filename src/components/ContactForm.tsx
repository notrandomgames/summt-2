import { useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, Mail } from 'lucide-react';

interface SavedInquiry {
  name: string;
  contact: string;
  businessType: string;
  packageChoice: string;
  message: string;
}

export function ContactForm() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [packageChoice, setPackageChoice] = useState('Starter Page (From KSh 200)');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SavedInquiry | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedContact = contact.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (trimmedContact.length < 5) {
      setErrorMsg('Please enter your WhatsApp number or email address so I can reply.');
      return;
    }
    if (trimmedMessage.length < 6) {
      setErrorMsg('Tell me a little about your business or what you need on the website.');
      return;
    }

    setErrorMsg(null);
    const inquiry: SavedInquiry = {
      name: trimmedName,
      contact: trimmedContact,
      businessType: businessType.trim() || 'Local business',
      packageChoice,
      message: trimmedMessage,
    };

    try {
      const existingRaw = localStorage.getItem('summit_inquiries');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(
        'summit_inquiries',
        JSON.stringify([{ ...inquiry, createdAt: new Date().toISOString() }, ...existing])
      );
    } catch {
      // Ignore storage errors if browsing in strict privacy mode
    }

    setSubmitted(inquiry);
  };

  const buildMailtoHref = (data: SavedInquiry) => {
    const subject = encodeURIComponent(`Website inquiry from ${data.name} (${data.businessType})`);
    const body = encodeURIComponent(
      `Hi Emmanuel,\n\nName: ${data.name}\nContact: ${data.contact}\nBusiness: ${data.businessType}\nPackage: ${data.packageChoice}\n\nDetails:\n${data.message}`
    );
    return `mailto:emmannthiga25@gmail.com?subject=${subject}&body=${body}`;
  };

  const buildInstagramOrWhatsAppText = (data: SavedInquiry) => {
    return encodeURIComponent(
      `Hi Emmanuel, I'm ${data.name} (${data.businessType}). I'm interested in the ${data.packageChoice}. ${data.message}`
    );
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#0F5C43]" />
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900">
              Thanks, {submitted.name}. Your note is ready.
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              To make sure I see it right away on my phone, send it straight via email or copy it into a DM on Instagram.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">
            {submitted.businessType} · {submitted.packageChoice}
          </p>
          <p className="mt-1 text-slate-600">{submitted.message}</p>
          <p className="mt-2 text-xs text-slate-500">Reply to: {submitted.contact}</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={buildMailtoHref(submitted)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#0F5C43] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0B4734]"
          >
            <Mail className="h-4 w-4" />
            Send to emmannthiga25@gmail.com
          </a>
          <a
            href={`https://wa.me/?text=${buildInstagramOrWhatsAppText(submitted)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
          >
            <MessageCircle className="h-4 w-4 text-[#0F5C43]" />
            Share via WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmitted(null);
              setName('');
              setContact('');
              setBusinessType('');
              setMessage('');
            }}
            className="min-h-[44px] px-3 text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900"
          >
            Write another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-slate-800">
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grace Muthoni"
            required
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
          />
        </div>

        <div>
          <label htmlFor="contact-info" className="block text-sm font-medium text-slate-800">
            WhatsApp number or email
          </label>
          <input
            id="contact-info"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="e.g. 0712 345 678 or grace@..."
            required
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="business-type" className="block text-sm font-medium text-slate-800">
            Type of business
          </label>
          <input
            id="business-type"
            type="text"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="e.g. Salon in Ruaka, Caterer, Hardware"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
          />
        </div>

        <div>
          <label htmlFor="package-choice" className="block text-sm font-medium text-slate-800">
            What do you need?
          </label>
          <select
            id="package-choice"
            value={packageChoice}
            onChange={(e) => setPackageChoice(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
          >
            <option value="Starter Page (From KSh 200)">Starter Page (From KSh 200)</option>
            <option value="Full Local Business Site (From KSh 4,500)">
              Full Local Business Site (From KSh 4,500)
            </option>
            <option value="Custom Order & Booking Site (From KSh 9,500)">
              Custom Order & Booking Site (From KSh 9,500)
            </option>
            <option value="Not sure yet — help me choose">Not sure yet — help me choose</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="block text-sm font-medium text-slate-800">
          What should be on your website?
        </label>
        <textarea
          id="contact-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me what you sell or offer, where your shop is located, and if you already have photos or a price list."
          required
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
        />
      </div>

      {errorMsg && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {errorMsg}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <button
          type="submit"
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-[#0F5C43] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4734] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C43]"
        >
          Send message to Emmanuel
        </button>
        <span className="text-xs text-slate-500">
          Or email directly:{' '}
          <a href="mailto:emmannthiga25@gmail.com" className="font-medium text-slate-700 underline underline-offset-2">
            emmannthiga25@gmail.com
          </a>
        </span>
      </div>
    </form>
  );
}
