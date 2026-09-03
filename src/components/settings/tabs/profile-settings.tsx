'use client';

import React from 'react';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Mail } from 'lucide-react';
import LogoutButton from '@/components/global/logout-button';

export default function ProfileSettings() {
  const { user } = useSupabaseUser();

  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : '?';

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold tracking-tight">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal account information.
        </p>
        <Separator className="my-4" />
        <div className="flex items-start gap-5">
          <Avatar className="h-14 w-14">
            <AvatarImage src="" />
            <AvatarFallback className="bg-accent text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {user?.email || 'Not signed in'}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Profile picture</Label>
              <p className="text-xs text-muted-foreground">
                Profile pictures are managed through your authentication provider.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold tracking-tight">Session</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your current session.
        </p>
        <Separator className="my-4" />
        <LogoutButton>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Sign out
          </Button>
        </LogoutButton>
      </section>
    </div>
  );
}
