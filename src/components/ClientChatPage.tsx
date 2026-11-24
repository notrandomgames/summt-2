import { useState } from 'react';
import { ArrowLeft, MessageSquare, Plus } from 'lucide-react';
import { CONTACT_INFO } from '../data/samples';
import { loadSavedClientThreads, type SavedClientThreadRef } from '../lib/threads';
import { useUnreadReplies } from '../hooks/useUnreadReplies';
import { ContactLookupBar } from './ContactLookupBar';
import { ThreadConversation } from './ThreadConversation';

interface ClientChatPageProps {
  initialThreadId?: string | null;
  onBack: () => void;
  onStartNewInquiry: () => void;
}

export function ClientChatPage({
  initialThreadId,
  onBack,
  onStartNewInquiry,
}: ClientChatPageProps) {
  const [savedThreads, setSavedThreads] = useState<SavedClientThreadRef[]>(() =>
    loadSavedClientThreads()
  );
  const { unreadThreadIds } = useUnreadReplies(savedThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => {
    if (initialThreadId) return initialThreadId;
    const existing = loadSavedClientThreads();
    return existing.length > 0 ? existing[0].threadId : null;
  });

  const handleThreadsFound = (found: SavedClientThreadRef[]) => {
    setSavedThreads(loadSavedClientThreads());
    if (found[0]) {
      setActiveThreadId(found[0].threadId);
    }
  };

  const activeMeta = savedThreads.find((t) => t.threadId === activeThreadId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Summit Digital
          </button>

          <button
            type="button"
            onClick={onStartNewInquiry}
            className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg bg-[#0F5C43] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0B4734]"
          >
            <Plus className="h-3.5 w-3.5" />
            New inquiry
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-10 sm:px-6">
        <div>
          <p className="text-xs font-semibold text-[#0F5C43]">
            {CONTACT_INFO.brandName} · Built by {CONTACT_INFO.ownerName}
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-slate-900">
            Your messages with Emman
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Read replies from Emman and send follow-up messages anytime. If you messaged from another device, enter your WhatsApp number or email and your 4-digit Chat PIN below to open your chat.
          </p>
        </div>

        <ContactLookupBar onThreadsFound={handleThreadsFound} />

        {savedThreads.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <MessageSquare className="h-3.5 w-3.5 text-[#0F5C43]" />
              Saved chats:
            </span>
            {savedThreads.map((item) => {
              const isSelected = activeThreadId === item.threadId;
              const isUnread = Boolean(unreadThreadIds[item.threadId]) && !isSelected;
              return (
                <button
                  key={item.threadId}
                  type="button"
                  onClick={() => setActiveThreadId(item.threadId)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#0F5C43] text-white'
                      : isUnread
                        ? 'border border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isUnread && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
                  <span>{item.businessType}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeThreadId ? (
          <ThreadConversation
            threadId={activeThreadId}
            fallbackClientName={activeMeta?.clientName}
            fallbackBusinessType={activeMeta?.businessType}
            onStartNewInquiry={onStartNewInquiry}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center sm:p-8">
            <p className="font-display text-base font-semibold text-slate-900">
              No saved chat open on this browser yet
            </p>
            <p className="mt-1.5 text-sm text-slate-600">
              Enter your WhatsApp number or email and 4-digit Chat PIN above to load an earlier conversation, or start a fresh inquiry with Emman.
            </p>
            <button
              type="button"
              onClick={onStartNewInquiry}
              className="mt-5 inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-[#0F5C43] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B4734]"
            >
              Send a message to Emman
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
