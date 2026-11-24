# Security Specification for Summit Digital Inquiries & Two-Way Messaging

## 1. Data Invariants
- `/inquiries/{inquiryId}` stores private contact PII (`contact`) and is strictly readable, listable, and deletable ONLY by `isAdmin()`.
- Public inquiry creation requires `status == 'new'`, a cryptographic `threadId` matching `^thr_[a-f0-9]+$` (28–64 chars), server timestamps (`request.time`), and atomic creation (`existsAfter`) of the corresponding `/threads/{threadId}` document.
- `/threads/{threadId}` holds NO phone or email PII. Listing `/threads` is restricted to `isAdmin()`. Reading or replying to a specific thread requires either `isAdmin()` or possessing the unguessable `threadId` capability token.
- Unauthenticated thread token holders can only update `lastMessagePreview`, `lastMessageBy == 'client'`, and `updatedAt == request.time` on `/threads/{threadId}` — they cannot change `status`, `inquiryId`, `clientName`, `businessType`, `packageChoice`, or `createdAt`.
- `/threads/{threadId}/messages/{messageId}` messages are immutable once written (`allow update: if false`), enforce `senderRole` (`'owner'` restricted strictly to `isAdmin()`, `'client'` requires valid `threadId` token), and enforce `resource.data.threadId == threadId` on list queries.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Reading `/inquiries/{id}` while signed out -> PERMISSION_DENIED
2. Listing `/inquiries` or `/threads` while signed out or as a non-admin user -> PERMISSION_DENIED
3. Creating `/inquiries/{id}` without atomically creating `/threads/{threadId}` -> PERMISSION_DENIED
4. Creating a message with `senderRole: 'owner'` while not `isAdmin()` -> PERMISSION_DENIED
5. Updating `/threads/{threadId}` as a client to change `status` or `clientName` -> PERMISSION_DENIED
6. Editing or tampering with an already-sent message in `/threads/{threadId}/messages/{messageId}` -> PERMISSION_DENIED
7. Creating a message in `/threads/{threadId}/messages/{messageId}` with a mismatched `threadId` field -> PERMISSION_DENIED
8. Creating an inquiry or message with a client-forged `createdAt != request.time` -> PERMISSION_DENIED
9. Creating a message with an empty or oversized (> 1500 chars) `body` -> PERMISSION_DENIED
10. Creating a thread or inquiry with an extra shadow field `isAdmin: true` -> PERMISSION_DENIED
11. Accessing `/threads/{shortGuess}` with a short or non-`thr_` token ID -> PERMISSION_DENIED
12. Deleting `/threads/{threadId}` or `/threads/{threadId}/messages/{messageId}` as a non-admin user -> PERMISSION_DENIED
