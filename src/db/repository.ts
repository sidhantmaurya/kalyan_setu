import { desc, eq, gte, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { contactMessages, newsletterSubscribers, profiles } from './schema.ts';

const DEFAULT_ADMIN_EMAILS = new Set([
  'sidhantmaurya140@gmail.com',
  'divyansh@kalyansetu.in',
  'hello@kalyansetu.in',
]);

function shouldAutoPromoteAdmin(email: string): boolean {
  const lower = email.toLowerCase().trim();
  if (DEFAULT_ADMIN_EMAILS.has(lower)) return true;
  const envAdmins = (process.env.ADMIN_NOTIFY_EMAILS || '')
    .split(',')
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);
  return envAdmins.includes(lower);
}

export async function getOrCreateProfile(
  uid: string,
  email: string,
  fullName?: string | null,
  avatarUrl?: string | null
) {
  try {
    const initialRole = shouldAutoPromoteAdmin(email) ? 'admin' : 'user';
    const existing = await db.select().from(profiles).where(eq(profiles.id, uid)).limit(1);

    if (existing.length > 0) {
      const current = existing[0];
      const nextRole = current.role === 'admin' || initialRole === 'admin' ? 'admin' : current.role;
      const updated = await db
        .update(profiles)
        .set({
          email,
          fullName: fullName || current.fullName,
          avatarUrl: avatarUrl || current.avatarUrl,
          role: nextRole,
          lastLoginAt: new Date(),
        })
        .where(eq(profiles.id, uid))
        .returning();
      return updated[0];
    }

    // Also check if another seeded profile row has the same email
    const byEmail = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    if (byEmail.length > 0) {
      const current = byEmail[0];
      const updated = await db
        .update(profiles)
        .set({
          fullName: fullName || current.fullName,
          avatarUrl: avatarUrl || current.avatarUrl,
          lastLoginAt: new Date(),
        })
        .where(eq(profiles.email, email))
        .returning();
      return updated[0];
    }

    const inserted = await db
      .insert(profiles)
      .values({
        id: uid,
        email,
        fullName: fullName || email.split('@')[0],
        avatarUrl: avatarUrl || '',
        role: initialRole,
        lastLoginAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          email,
          lastLoginAt: new Date(),
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateProfile:', error);
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}

export async function getProfileByUid(uid: string, email?: string) {
  try {
    const byId = await db.select().from(profiles).where(eq(profiles.id, uid)).limit(1);
    if (byId.length > 0) return byId[0];
    if (email) {
      const byEmail = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
      if (byEmail.length > 0) return byEmail[0];
    }
    return null;
  } catch (error) {
    console.error('Database query failed in getProfileByUid:', error);
    throw new Error('Failed to load user profile.', { cause: error });
  }
}

export async function updateProfilePhone(uid: string, phone: string | null) {
  try {
    const updated = await db
      .update(profiles)
      .set({ phone })
      .where(eq(profiles.id, uid))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.error('Database query failed in updateProfilePhone:', error);
    throw new Error('Failed to update phone number.', { cause: error });
  }
}

export async function deleteProfileByUid(uid: string) {
  try {
    await db
      .update(contactMessages)
      .set({ userId: null })
      .where(eq(contactMessages.userId, uid));
    await db.delete(profiles).where(eq(profiles.id, uid));
    return true;
  } catch (error) {
    console.error('Database query failed in deleteProfileByUid:', error);
    throw new Error('Failed to delete user profile.', { cause: error });
  }
}

export async function countRecentMessagesByEmail(email: string): Promise<number> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const rows = await db
      .select({ id: contactMessages.id, createdAt: contactMessages.createdAt })
      .from(contactMessages)
      .where(eq(contactMessages.email, email));
    return rows.filter((r) => new Date(r.createdAt) >= oneHourAgo).length;
  } catch (error) {
    console.error('Database query failed in countRecentMessagesByEmail:', error);
    throw new Error('Failed to verify submission rate limit.', { cause: error });
  }
}

export async function insertContactMessage(data: {
  userId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  reason: string;
  message: string;
}) {
  try {
    const inserted = await db
      .insert(contactMessages)
      .values({
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        reason: data.reason,
        message: data.message,
        status: 'new',
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in insertContactMessage:', error);
    throw new Error('Failed to save contact message.', { cause: error });
  }
}

export async function updateMessageNotification(
  messageId: number,
  notifiedAt: Date | null,
  notificationError: string | null
) {
  try {
    const updated = await db
      .update(contactMessages)
      .set({
        notifiedAt,
        notificationError,
      })
      .where(eq(contactMessages.id, messageId))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.error('Database query failed in updateMessageNotification:', error);
    throw new Error('Failed to update notification status.', { cause: error });
  }
}

export async function getMessagesForUser(uid: string, email?: string) {
  try {
    const allMessages = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    return allMessages.filter(
      (m) => m.userId === uid || (email && m.email.toLowerCase() === email.toLowerCase())
    );
  } catch (error) {
    console.error('Database query failed in getMessagesForUser:', error);
    throw new Error('Failed to load your messages.', { cause: error });
  }
}

export async function getAllMessagesForAdmin() {
  try {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllMessagesForAdmin:', error);
    throw new Error('Failed to load contact messages.', { cause: error });
  }
}

export async function getMessageByIdForAdmin(id: number) {
  try {
    const rows = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id))
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getMessageByIdForAdmin:', error);
    throw new Error('Failed to load message details.', { cause: error });
  }
}

export async function updateMessageAdminFields(
  id: number,
  updates: { status?: string; adminNotes?: string | null }
) {
  try {
    const updated = await db
      .update(contactMessages)
      .set(updates)
      .where(eq(contactMessages.id, id))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.error('Database query failed in updateMessageAdminFields:', error);
    throw new Error('Failed to update message.', { cause: error });
  }
}

export async function getAllProfilesForAdmin() {
  try {
    const allProfiles = await db.select().from(profiles).orderBy(desc(profiles.createdAt));
    const allMessages = await db.select().from(contactMessages);

    const countByUserId = new Map<string, number>();
    const countByEmail = new Map<string, number>();

    for (const msg of allMessages) {
      if (msg.userId) {
        countByUserId.set(msg.userId, (countByUserId.get(msg.userId) || 0) + 1);
      }
      const lowerEmail = msg.email.toLowerCase();
      countByEmail.set(lowerEmail, (countByEmail.get(lowerEmail) || 0) + 1);
    }

    return allProfiles.map((p) => ({
      ...p,
      messagesSent: Math.max(
        countByUserId.get(p.id) || 0,
        countByEmail.get(p.email.toLowerCase()) || 0
      ),
    }));
  } catch (error) {
    console.error('Database query failed in getAllProfilesForAdmin:', error);
    throw new Error('Failed to load registered users.', { cause: error });
  }
}

export async function updateProfileRoleByAdmin(targetId: string, newRole: 'user' | 'admin') {
  try {
    const updated = await db
      .update(profiles)
      .set({ role: newRole })
      .where(eq(profiles.id, targetId))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.error('Database query failed in updateProfileRoleByAdmin:', error);
    throw new Error('Failed to update user role.', { cause: error });
  }
}

export async function subscribeNewsletter(email: string) {
  try {
    const normalized = email.toLowerCase().trim();
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, normalized))
      .limit(1);

    if (existing.length > 0) {
      return { alreadySubscribed: true, subscriber: existing[0] };
    }

    const inserted = await db
      .insert(newsletterSubscribers)
      .values({ email: normalized })
      .returning();

    return { alreadySubscribed: false, subscriber: inserted[0] };
  } catch (error) {
    console.error('Database query failed in subscribeNewsletter:', error);
    throw new Error('Failed to subscribe to newsletter.', { cause: error });
  }
}

export async function getAllSubscribersForAdmin() {
  try {
    return await db
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllSubscribersForAdmin:', error);
    throw new Error('Failed to load newsletter subscribers.', { cause: error });
  }
}
