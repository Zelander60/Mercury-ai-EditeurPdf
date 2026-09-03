import React from 'react';

import db from '@/lib/supabase/db';
import { redirect } from 'next/navigation';
import DashboardSetup from '@/components/dashboard-setup/dashboard-setup';
import { getUserSubscriptionStatus } from '@/lib/supabase/queries';
import { getServerUser } from '@/lib/auth';

const DashboardPage = async () => {
  const user = await getServerUser();

  if (!user) redirect('/login');

  const workspace = await db.query.workspaces.findFirst({
    where: (workspace, { eq }) => eq(workspace.workspaceOwner, user.id),
  });

  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  if (subscriptionError) return;

  if (!workspace)
    return (
      <div
        className="bg-background
        h-screen
        w-screen
        flex
        justify-center
        items-center
  "
      >
        <DashboardSetup user={user} subscription={subscription} />
      </div>
    );

  redirect(`/dashboard/${workspace.id}`);
};

export default DashboardPage;