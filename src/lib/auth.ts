import { auth, currentUser } from '@clerk/nextjs/server';

export type AppUser = {
  id: string;
  email?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

export const getServerUser = async (): Promise<AppUser | null> => {
  const { userId } = await auth();
  if (!userId) return null;
  const u = await currentUser();
  const email =
    u?.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)
      ?.emailAddress ??
    u?.emailAddresses[0]?.emailAddress ??
    undefined;
  return {
    id: userId,
    email,
    fullName: u?.fullName ?? null,
    avatarUrl: u?.imageUrl ?? null,
  };
};