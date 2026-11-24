# Security Specification for Summit Inquiries

## 1. Data Invariants
- Every inquiry in `/inquiries/{inquiryId}` must contain strictly bounded `name`, `contact`, `businessType`, `packageChoice`, `message`, `status`, `createdAt`, and `updatedAt` fields.
- Clients creating an inquiry can only set `status == 'new'`, `createdAt == request.time`, and `updatedAt == request.time`.
- Only the verified site owner (`isAdmin()`, matching `emmannthiga25@gmail.com` with `email_verified == true` or a record in `/admins/{uid}`) may read, list, update status, or delete inquiries (PII isolation).
- Document IDs must pass `isValidId()` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).

## 2. Adversarial Payloads ("Dirty Dozen")
1. Reading `/inquiries/{id}` while signed out -> PERMISSION_DENIED
2. Listing `/inquiries` while signed in as a non-admin verified user -> PERMISSION_DENIED
3. Reading `/inquiries/{id}` as `emmannthiga25@gmail.com` with `email_verified: false` -> PERMISSION_DENIED
4. Creating an inquiry with an extra shadow field `isAdmin: true` -> PERMISSION_DENIED
5. Creating an inquiry with `status: 'replied'` instead of `'new'` -> PERMISSION_DENIED
6. Creating an inquiry with a client-forged `createdAt` timestamp != `request.time` -> PERMISSION_DENIED
7. Creating an inquiry with an oversized `message` (> 1500 chars) -> PERMISSION_DENIED
8. Creating an inquiry with an invalid `packageChoice` enum value -> PERMISSION_DENIED
9. Creating an inquiry with an oversized or invalid document ID -> PERMISSION_DENIED
10. Updating an inquiry as a non-admin user -> PERMISSION_DENIED
11. Admin updating an immutable field (`createdAt` or `message`) -> PERMISSION_DENIED
12. Deleting an inquiry while signed in as a non-admin user -> PERMISSION_DENIED
