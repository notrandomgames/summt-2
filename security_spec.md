# Security Specification for Summit Digital Inquiries, Threads & Contact Lookup

## 1. Data Invariants
- `/inquiries/{inquiryId}` stores private contact PII (`contact`) and is strictly readable, listable, and deletable ONLY by `isAdmin()`.
- Public inquiry creation requires `status == 'new'`, a cryptographic `threadId` matching `^thr_[a-f0-9]+$` (28–64 chars), server timestamps (`request.time`), and atomic creation (`existsAfter`) of the corresponding `/threads/{threadId}` document.
- `/threads/{threadId}` holds NO phone or email PII. Listing `/threads` is restricted to `isAdmin()`.
- `/threadLookups/{lookupHash}` keys documents strictly by `^lk_[a-f0-9]{64}$` (SHA-256 hash of normalized contact), allows `get` only by exact lookup hash, forbids public `list`, and bounds `threads` array size between 1 and 10 with `existsAfter` verification that `threads[0].threadId` is a valid thread being created atomically.
- `/threads/{threadId}/messages/{messageId}` messages are immutable once written (`allow update: if false`), enforce `senderRole` (`'owner'` restricted strictly to `isAdmin()`, `'client'` requires valid `threadId` token), and enforce `resource.data.threadId == threadId` on list queries.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Reading `/inquiries/{id}` while signed out -> PERMISSION_DENIED
2. Listing `/inquiries`, `/threads`, or `/threadLookups` while signed out or as a non-admin user -> PERMISSION_DENIED
3. Creating `/inquiries/{id}` without atomically creating `/threads/{threadId}` -> PERMISSION_DENIED
4. Creating a message with `senderRole: 'owner'` while not `isAdmin()` -> PERMISSION_DENIED
5. Updating `/threads/{threadId}` as a client to change `status` or `clientName` -> PERMISSION_DENIED
6. Editing or tampering with an already-sent message in `/threads/{threadId}/messages/{messageId}` -> PERMISSION_DENIED
7. Creating `/threadLookups/{lookupHash}` with an invalid or non-existent `threadId` -> PERMISSION_DENIED
8. Updating `/threadLookups/{lookupHash}` to shrink or erase existing threads -> PERMISSION_DENIED
9. Creating `/threadLookups/{lookupHash}` with an oversized `threads` array (> 10 items) -> PERMISSION_DENIED
10. Creating a thread, inquiry, or lookup with a client-forged timestamp != `request.time` -> PERMISSION_DENIED
11. Creating a thread or inquiry with an extra shadow field `isAdmin: true` -> PERMISSION_DENIED
12. Deleting `/threads/{threadId}`, `/threadLookups/{lookupHash}`, or `/threads/{threadId}/messages/{messageId}` as a non-admin user -> PERMISSION_DENIED
