'use client';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { User } from '@/lib/supabase/supabase.types';
import React, { useEffect, useRef, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '../ui/label';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { getUsersFromSearch } from '@/lib/supabase/queries';

interface CollaboratorSearchProps {
  existingCollaborators: User[] | [];
  getCollaborator: (collaborator: User) => void;
  children: React.ReactNode;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  children,
  existingCollaborators,
  getCollaborator,
}) => {
  const { user } = useSupabaseUser();
  const [searchResults, setSearchResults] = useState<User[] | []>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const res = await getUsersFromSearch(e.target.value);
      setSearchResults(res);
    }, 450);
  };

  const addCollaborator = (user: User) => {
    getCollaborator(user);
  };

  return (
    <Sheet>
      <SheetTrigger className="w-full">{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Search Collaborator</SheetTitle>
          <SheetDescription>
            <p className="text-sm text-muted-foreground">
              You can also remove collaborators after adding them from the
              settings tab.
            </p>
          </SheetDescription>
        </SheetHeader>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="name"
            className="h-9 pl-9"
            placeholder="Search by email…"
            autoFocus
            onChange={onChangeHandler}
          />
        </div>
        <ScrollArea className="mt-2 h-[50vh] w-full">
          {searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <Search className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Type an email to find collaborators.
              </p>
            </div>
          ) : (
            searchResults
              .filter(
                (result) =>
                  !existingCollaborators.some(
                    (existing) => existing.id === result.id
                  )
              )
              .filter((result) => result.id !== user?.id)
              .map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between border-b border-border/50 py-3 pr-2 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs">
                        {result.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-[220px] truncate text-sm text-muted-foreground">
                      {result.email}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => addCollaborator(result)}
                  >
                    Add
                  </Button>
                </div>
              ))
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CollaboratorSearch;
