'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import db from '@/lib/supabase/db';
import { users } from '@/lib/supabase/schema';

export const ensureUser = async () => {
  const { userId } = await auth();
  if (!userId) return { data: null, error: 'Not signed in' };

  const u = await currentUser();
  const email = u?.emailAddresses[0]?.emailAddress ?? null;
  const fullName = u?.fullName ?? null;
  const avatarUrl = u?.imageUrl ?? null;

  try {
    await db
      .insert(users)
      .values({ id: userId, email, fullName, avatarUrl })
      .onConflictDoUpdate({
        target: users.id,
        set: { email, fullName, avatarUrl },
      });
    return { data: null, error: null };
  } catch (e) {
    console.log('ensureUser error', e);
    return { data: null, error: 'Could not sync user' };
  }
};