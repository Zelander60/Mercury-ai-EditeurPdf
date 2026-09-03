import React from 'react';
import { Subscription } from '@/lib/supabase/supabase.types';
import { createClient } from '@/lib/supabase/server';
import db from '@/lib/supabase/db';
import { auth } from '@clerk/nextjs/server';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ModeToggle from '../global/mode-toggle';
import { LogOut } from 'lucide-react';
import LogoutButton from '../global/logout-button';

interface UserCardProps {
  subscription: Subscription | null;
}

const UserCard: React.FC<UserCardProps> = async ({ subscription }) => {
  const { userId } = await auth();
  if (!userId) return null;

  const response = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });
  if (!response) return null;

  const supabase = await createClient();
  let avatarPath;
  if (!response.avatarUrl) avatarPath = '';
  else {
    avatarPath = supabase.storage
      .from('avatars')
      .getPublicUrl(response.avatarUrl)?.data.publicUrl;
  }
  const profile = {
    ...response,
    avatarUrl: avatarPath,
  };

  return (
    <article
      className="hidden
      sm:flex
      justify-between
      items-center
      px-4
      py-2
      rounded-xl
      bg-accent/40
      border
      border-border/50
  "
    >
      <aside className="flex justify-center items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback className="text-xs font-semibold">
            {profile.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">
            {subscription?.status === 'active' ? 'Pro Plan' : 'Free Plan'}
          </span>
          <small
            className="w-[100px]
          truncate
          text-xs text-foreground
          "
          >
            {profile.email}
          </small>
        </div>
      </aside>
      <div className="flex items-center gap-1">
        <LogoutButton>
          <LogOut className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </LogoutButton>
        <ModeToggle />
      </div>
    </article>
  );
};

export default UserCard;