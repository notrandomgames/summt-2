import { useEffect, useState } from 'react';
import { doc, onSnapshot, type Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  getThreadSeenMap,
  isValidThreadToken,
  type MessageSenderRole,
  type SavedClientThreadRef,
} from '../lib/threads';

interface ThreadActivity {
  lastMessageBy: MessageSenderRole;
  updatedAtMs: number;
}

export function useUnreadReplies(threads: SavedClientThreadRef[]): {
  unreadThreadIds: Record<string, boolean>;
  unreadCount: number;
} {
  const [activityMap, setActivityMap] = useState<Record<string, ThreadActivity>>({});
  const [seenMap, setSeenMap] = useState<Record<string, number>>(() => getThreadSeenMap());

  useEffect(() => {
    const syncSeen = () => {
      setSeenMap(getThreadSeenMap());
    };
    window.addEventListener('summit-threads-seen', syncSeen);
    window.addEventListener('storage', syncSeen);
    return () => {
      window.removeEventListener('summit-threads-seen', syncSeen);
      window.removeEventListener('storage', syncSeen);
    };
  }, []);

  const threadKey = threads.map((t) => t.threadId).join(',');

  useEffect(() => {
    const validIds = threads.map((t) => t.threadId).filter(isValidThreadToken);
    if (validIds.length === 0) {
      setActivityMap({});
      return;
    }

    const unsubscribers = validIds.map((threadId) =>
      onSnapshot(
        doc(db, 'threads', threadId),
        (snap) => {
          if (!snap.exists()) return;
          const data = snap.data();
          const updatedAt = data.updatedAt as Timestamp | null | undefined;
          const updatedAtMs = updatedAt ? updatedAt.toMillis() : 0;
          const lastMessageBy = (data.lastMessageBy as MessageSenderRole) ?? 'client';

          setActivityMap((prev) => ({
            ...prev,
            [threadId]: { lastMessageBy, updatedAtMs },
          }));
        },
        () => {
          // Ignore silent background listener issues for unread badge
        }
      )
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [threadKey]);

  const unreadThreadIds: Record<string, boolean> = {};
  let unreadCount = 0;

  threads.forEach((item) => {
    const activity = activityMap[item.threadId];
    if (!activity) return;
    const seenAt = seenMap[item.threadId] ?? 0;
    const isUnread = activity.lastMessageBy === 'owner' && activity.updatedAtMs > seenAt;
    if (isUnread) {
      unreadThreadIds[item.threadId] = true;
      unreadCount += 1;
    }
  });

  return { unreadThreadIds, unreadCount };
}
