'use client';
import { useClerk } from '@clerk/nextjs';
import { useAppState } from '@/lib/providers/state-provider';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '../ui/button';

interface LogoutButtonProps {
  children: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ children }) => {
  const { signOut } = useClerk();
  const { dispatch } = useAppState();
  const router = useRouter();
  const logout = async () => {
    await signOut(() => router.push('/login'));
    dispatch({ type: 'SET_WORKSPACES', payload: { workspaces: [] } });
  };
  return (
    <Button variant="ghost" size="icon" className="p-0" onClick={logout}>
      {children}
    </Button>
  );
};

export default LogoutButton;