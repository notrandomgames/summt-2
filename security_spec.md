# Security Specification for Summit Digital Inquiries, Threads & PIN Lookup

## 1. Data Invariants
- All Firestore reads and writes require at least an authenticated Firebase session (`request.auth != null` via Anonymous Auth for clients or verified Google Sign-In for the owner).
- `/inquiries/{inquiryId}` stores private contact PII (`contact`) and is strictly readable, listable, and deletable ONLY by `isAdmin()`.
- `/threadLookups/{lookupHash}` keys documents strictly by `^lk_[a-f0-9]{64}$`, computed from SHA-256 of BOTH the normalized contact AND the client's 4-digit Chat PIN. Every array element (1..5) in `threads` is individually schema-validated.
- `/threads/{threadId}` records `clientUid == request.auth.uid` on client creation and forbids clients from modifying `lastMessagePreview`, `status`, `clientUid`, or immutable metadata on update.
- `/threads/{threadId}/messages/{messageId}` enforces `senderUid == request.auth.uid`, verifies client `senderName` strictly equals the parent thread's `clientName`, forbids client-forged `owner` messages, and is immutable once created.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Reading or writing `/threads/{threadId}`, `/threadLookups/{hash}`, or `/inquiries/{id}` without `request.auth` -> PERMISSION_DENIED
2. Looking up `/threadLookups/{hash}` with phone/email only (missing PIN) -> hash mismatch, not found
3. Creating `/threadLookups/{hash}` with an invalid unvalidated entry at `threads[1]` -> PERMISSION_DENIED
4. Creating `/threads/{threadId}` with `clientUid != request.auth.uid` -> PERMISSION_DENIED
5. Updating `/threads/{threadId}` as a client to alter `lastMessagePreview` or `status` -> PERMISSION_DENIED
6. Creating a message in `/threads/{threadId}/messages/{id}` with `senderName` differing from thread `clientName` -> PERMISSION_DENIED
7. Creating a message in `/threads/{threadId}/messages/{id}` with `senderUid != request.auth.uid` -> PERMISSION_DENIED
8. Creating a message with `senderRole: 'owner'` while not `isAdmin()` -> PERMISSION_DENIED
9. Editing or tampering with an already-sent message -> PERMISSION_DENIED
10. Reading `/inquiries/{id}` or listing `/inquiries`, `/threads`, or `/threadLookups` as an anonymous or non-admin user -> PERMISSION_DENIED
11. Creating any record with a client-forged timestamp != `request.time` -> PERMISSION_DENIED
12. Deleting `/inquiries/{id}` without cleaning up subcollection messages -> resolved in `OwnerInbox` batch delete
