export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { ThemeProvider } from '@/lib/providers/next-theme-provider';
import AppStateProvider from '@/lib/providers/state-provider';
import { SupabaseUserProvider } from '@/lib/providers/supabase-user-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-notion',
});

export const metadata: Metadata = {
  title: {
    default: 'BookGenerator — The publishing workspace for teams and AI agents',
    template: '%s | BookGenerator',
  },
  description: 'Where manuscripts become print-ready books in 90 seconds. AI as infrastructure, covers that convert, canvas that exports.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} bg-background font-notion antialiased`}>
        <ClerkProvider
          signInUrl="/login"
          signUpUrl="/signup"
          afterSignOutUrl="/"
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
          >
            <AppStateProvider>
              <SupabaseUserProvider>
                {children}

              </SupabaseUserProvider>
            </AppStateProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
