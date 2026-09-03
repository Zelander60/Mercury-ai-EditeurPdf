export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/supabase/db';
import { workspaces } from '@/lib/supabase/schema';
import { eq } from 'drizzle-orm';
import SettingsPageClient from '@/components/settings/settings-page';

const SettingsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const { workspaceId } = await params;
  const { tab } = await searchParams;

  const ws = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });

  if (!ws) redirect('/dashboard');

  return (
    <SettingsPageClient
      workspaceId={workspaceId}
      workspace={ws as any}
      activeTab={tab || 'workspace'}
    />
  );
};

export default SettingsPage;
