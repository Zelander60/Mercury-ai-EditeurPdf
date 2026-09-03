'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, Show } from '@clerk/nextjs';
import { BookOpen, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import ModeToggle from '@/components/global/mode-toggle';
import { Separator } from '@/components/ui/separator';
import { CommandPalette } from '@/components/global/command-palette';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">BookGenerator</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? 'text-sm font-medium text-primary'
                  : 'text-sm font-medium text-muted-foreground transition-colors hover:text-primary'
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <CommandPalette />
          </div>
          <ModeToggle />
          <div className="hidden items-center gap-2 md:flex">
            <Show
              when="signed-out"
              fallback={
                <UserButton
                  appearance={{ elements: { avatarBox: 'h-8 w-8' } }}
                />
              }
            >
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </Show>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="mt-6 flex flex-col gap-4">
                  <Link href="/" className="text-lg font-semibold">
                    BookGenerator
                  </Link>
                  <Separator />
                  {navLinks.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <Separator />
                  <Show when="signed-out">
                    <SheetClose asChild>
                      <Button asChild variant="ghost">
                        <Link href="/login">Login</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </SheetClose>
                  </Show>
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;