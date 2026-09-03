'use client';

import { useUser } from '@clerk/nextjs';
import { Subscription } from '../supabase/supabase.types';
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserSubscriptionStatus } from '../supabase/queries';
import { ensureUser } from '../server-actions/user-actions';
import { useToast } from '@/components/ui/use-toast';

export type AppUser = {
  id: string;
  email?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

type SupabaseUserContextType = {
  user: AppUser | null;
  subscription: Subscription | null;
};

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  subscription: null,
});

export const useSupabaseUser = () => {
  return useContext(SupabaseUserContext);
};

interface SupabaseUserProviderProps {
  children: React.ReactNode;
}

export const SupabaseUserProvider: React.FC<SupabaseUserProviderProps> = ({
  children,
}) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [user, setUser] = useState<AppUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoaded) return;
    if (!clerkUser || !isSignedIn) {
      setUser(null);
      setSubscription(null);
      return;
    }

    const init = async () => {
      try {
        await ensureUser();
      } catch (e) {
        console.error('ensureUser failed', e);
      }
      setUser({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? undefined,
        fullName: clerkUser.fullName,
        avatarUrl: clerkUser.imageUrl,
      });
      const { data, error } = await getUserSubscriptionStatus(clerkUser.id);
      if (data) setSubscription(data);
      if (error) {
        toast({
          title: 'Unexpected Error',
          description:
            'Oops! An unexpected error happened. Try again later.',
        });
      }
    };
    init();
  }, [isLoaded, isSignedIn, clerkUser, toast]);

  return (
    <SupabaseUserContext.Provider value={{ user, subscription }}>
      {children}
    </SupabaseUserContext.Provider>
  );
};