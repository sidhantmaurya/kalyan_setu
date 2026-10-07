# KalyanSetu — Serving Nourishment, Building Connection

**Affordable Food. Dignified Lives.**  
Founder: **Divyansh Rai** (Central University of Kerala)  
Business Category: Restaurants and mobile food service activities (NIC Code: `56100`)

---

## Architecture Overview

1. **Managed PostgreSQL Database & Drizzle ORM (`src/db/`)**:
   - `profiles`: Stores Google-authenticated users and roles (`user` | `admin`).
   - `contact_messages`: Stores all contact inquiries with validation, honeypot protection, rate limiting (max 5/hour per email), status tracking (`new` | `read` | `replied` | `archived`), internal admin notes, and email notification timestamps.
   - `newsletter_subscribers`: Stores footer newsletter sign-ups.
2. **Google Sign-In Authentication (`src/lib/firebase.ts`, `src/lib/firebase-admin.ts`)**:
   - Google OAuth (`openid`, `email`, `profile`) is the sole sign-in method; no passwords are stored or handled anywhere.
   - Server-side ID token verification via `firebase-admin` and role-based access enforcement (`requireAuth`, `requireAdmin`).
3. **Contact Pipeline & Admin Email Notification (`src/lib/email.ts`)**:
   - Escapes all user-supplied fields before generating the Navy/Gold branded HTML and plain-text notification emails.
   - Sends transactional emails via **Resend** (`RESEND_API_KEY`) when configured, and provides a live HTML email preview & retry trigger inside `/admin/messages`.
4. **Full Sitemap (`src/pages/`)**:
   - Public routes: `/`, `/about`, `/founder`, `/people`, `/progress`, `/contact`, `/login`, `/privacy`, `/terms`
   - Authenticated user route: `/dashboard`
   - Admin routes: `/admin/login`, `/admin`, `/admin/messages`, `/admin/users`, `/admin/subscribers`
