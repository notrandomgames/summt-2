import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { lookupThreadsByContact, type SavedClientThreadRef } from '../lib/threads';

interface ContactLookupBarProps {
  onThreadsFound: (threads: SavedClientThreadRef[]) => void;
  compact?: boolean;
}

export function ContactLookupBar({ onThreadsFound, compact = false }: ContactLookupBarProps) {
  const [contactInput, setContactInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    const raw = contactInput.trim();
    if (!raw) {
      setStatusMsg('Enter the WhatsApp number or email you used to message Emman.');
      return;
    }

    setStatusMsg(null);
    setSearching(true);
    try {
      const found = await lookupThreadsByContact(raw);
      if (found.length === 0) {
        setStatusMsg('No saved chat found for that number or email yet.');
      } else {
        setContactInput('');
        onThreadsFound(found);
      }
    } catch (err) {
      setStatusMsg(
        err instanceof Error && err.message
          ? err.message
          : 'Could not look up your chat right now. Please try again.'
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleLookup(e)}
      className={
        compact
          ? 'rounded-xl border border-slate-200 bg-white p-4'
          : 'rounded-xl border border-slate-200 bg-white p-5 sm:p-6'
      }
    >
      <p className="text-xs font-semibold text-slate-800 sm:text-sm">
        Already sent a message? Open your chat with your phone or email
      </p>
      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={contactInput}
          onChange={(e) => {
            setContactInput(e.target.value);
            if (statusMsg) setStatusMsg(null);
          }}
          placeholder="e.g. 0712 345 678 or your@email.com"
          aria-label="WhatsApp number or email to open your chat"
          className="min-h-[44px] flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
        />
        <button
          type="submit"
          disabled={searching}
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap"
        >
          <Search className="h-4 w-4" />
          {searching ? 'Checking...' : 'Open my chat'}
        </button>
      </div>
      {statusMsg && (
        <p role="status" className="mt-2 text-xs font-medium text-amber-700">
          {statusMsg}
        </p>
      )}
    </form>
  );
}
