# KalyanSetu Firestore Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants

1. **Default-Deny Catch-All**: No unlisted collection or subcollection may be read or written (`match /{document=**} { allow read, write: if false; }`).
2. **PII Isolation (`profiles/{userId}`)**:
   - Contains PII (`email`, `phone`, `fullName`).
   - Only the profile owner (`request.auth.uid == userId`) or a verified Admin (`isAdmin()`) may `get` a profile.
   - Only a verified Admin (`isAdmin()`) may `list` profiles.
   - Standard users creating their profile can ONLY set `role == 'user'` (unless they are the bootstrapped admin email with `email_verified == true`).
   - Users updating their own profile may ONLY update `phone`, `fullName`, `avatarUrl`, or `lastLoginAt` and can NEVER modify `role`, `uid`, `email`, or `createdAt`.
   - Admins cannot demote their own `role` (`userId != request.auth.uid` when changing `role`).
3. **Contact Messages (`contact_messages/{messageId}`)**:
   - Anyone (guest visitor or signed-in user) may `create` a contact message ONLY IF:
     - All required keys are present and `hasOnly` allowed keys.
     - `status == 'new'`, `adminNotes == ''`.
     - If signed in, `userId == request.auth.uid`; if guest, `userId == 'guest'`.
     - `createdAt == request.time` and `updatedAt == request.time`.
   - Anonymous visitors can NEVER read (`get` or `list`) contact messages.
   - Signed-in users may `list` or `get` ONLY messages where `resource.data.userId == request.auth.uid`.
   - Verified Admins (`isAdmin()`) may `get`, `list`, `update` (`status`, `adminNotes`, `notifiedAt`, `notificationError`, `updatedAt`), and `delete` contact messages.
4. **Newsletter Subscribers (`newsletter_subscribers/{subscriberId}`)**:
   - Anyone may `create` a newsletter subscription with a valid email and `createdAt == request.time`.
   - Only verified Admins (`isAdmin()`) may `get`, `list`, or `delete` subscriber records.
5. **Unified Activity Logs (`activity_logs/{logId}`)**:
   - Stores `signup`, `signin`, `login`, `logout`, `subscriber`, and `contact_form` events.
   - Append-only (`allow update: if false`).
   - Auth events (`signup`, `signin`, `login`, `logout`) require `isVerifiedUser() && incoming().userId == request.auth.uid && incoming().email == request.auth.token.email` (or `isAdmin()`).
   - Public form events (`subscriber`, `contact_form`) require `(isVerifiedUser() && incoming().userId == request.auth.uid) || (!isSignedIn() && incoming().userId == 'guest')` (or `isAdmin()`).
   - Every log creation requires `incoming().createdAt == request.time`.
   - Only the user who generated the log (`existing().userId == request.auth.uid`) or a verified Admin (`isAdmin()`) can `get` or `list` activity logs.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Privilege Escalation on Create)**: Non-admin user attempts to create `/profiles/user_123` with `role: "admin"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Self-Role Promotion on Update)**: Regular user attempts to update `/profiles/user_123` changing `role` from `"user"` to `"admin"`. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow Field Injection)**: User creates `/profiles/user_123` with an extra undeclared key `isSuperUser: true`. -> `PERMISSION_DENIED`
4. **Payload 4 (PII Horizontal Scraping)**: Authenticated user `user_456` attempts `get` on `/profiles/user_123`. -> `PERMISSION_DENIED`
5. **Payload 5 (Unverified Admin Email Spoof)**: User with `email == "sidhantmaurya140@gmail.com"` but `email_verified == false` attempts admin read on `/profiles`. -> `PERMISSION_DENIED`
6. **Payload 6 (ID Poisoning Attack)**: Attacker attempts to create a document with a 300-character ID or invalid characters (`$bad/id`). -> `PERMISSION_DENIED`
7. **Payload 7 (Contact Message Pre-Marked Replied)**: Visitor submits `/contact_messages/msg_1` with `status: "replied"` or non-empty `adminNotes`. -> `PERMISSION_DENIED`
8. **Payload 8 (Activity Log Identity Spoofing)**: Unauthenticated guest attempts to create `/activity_logs/log_1` with `eventType: "login"` for `userId: "user_123"`. -> `PERMISSION_DENIED`
9. **Payload 9 (Denial of Wallet / Oversized Message)**: Visitor submits `/contact_messages/msg_1` with a 20,000-character `message` string (exceeding `maxLength: 5000`). -> `PERMISSION_DENIED`
10. **Payload 10 (Anonymous Activity Log Scraping)**: Unauthenticated visitor attempts `get` or `list` on `/activity_logs`. -> `PERMISSION_DENIED`
11. **Payload 11 (Forged Client Timestamp)**: Visitor creates `/newsletter_subscribers/sub_1` with a past/future `createdAt` instead of `request.time`. -> `PERMISSION_DENIED`
12. **Payload 12 (Activity Log Tampering on Update)**: Authenticated user attempts `update` on `/activity_logs/log_1` to alter `details`. -> `PERMISSION_DENIED`
