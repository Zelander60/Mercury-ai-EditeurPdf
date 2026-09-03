'use client';
import { workspace } from '@/lib/supabase/supabase.types';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useEffect, useState } from 'react';

interface SelectedWorkspaceProps {
  workspace: workspace;
  onClick?: (option: workspace) => void;
}

const SelectedWorkspace: React.FC<SelectedWorkspaceProps> = ({
  workspace,
  onClick,
}) => {
  const supabase = createClient();
  const [workspaceLogo, setWorkspaceLogo] = useState<string | null>(null);
  useEffect(() => {
    if (workspace.logo) {
      const path = supabase.storage
        .from('workspace-logos')
        .getPublicUrl(workspace.logo)?.data.publicUrl;
      if (path) setWorkspaceLogo(path);
    } else {
      setWorkspaceLogo(null);
    }
  }, [workspace, supabase]);
  return (
    <Link
      href={`/dashboard/${workspace.id}`}
      onClick={() => {
        if (onClick) onClick(workspace);
      }}
      className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
    >
      <Avatar className="h-[26px] w-[26px] rounded-md">
        <AvatarImage src={workspaceLogo || ''} alt="workspace logo" />
        <AvatarFallback className="rounded-md bg-primary/10 text-xs font-semibold text-primary">
          {workspace.title?.charAt(0).toUpperCase() || 'W'}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <p className="w-[170px] truncate text-sm font-medium">{workspace.title}</p>
      </div>
    </Link>
  );
};

export default SelectedWorkspace;