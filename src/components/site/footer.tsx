import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">BookGenerator</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              The publishing workspace for teams and AI agents. From outline to print-ready PDF in 90 seconds.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#demo" className="hover:text-foreground">Demo</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Login</Link></li>
              <li><Link href="/signup" className="hover:text-foreground">Sign up</Link></li>
              <li><span className="text-muted-foreground/60">Docs — coming soon</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><span className="text-muted-foreground/60">Privacy</span></li>
              <li><span className="text-muted-foreground/60">Terms</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 BookGenerator. All rights reserved.</span>
          <span>Made for authors who ship.</span>
        </div>
      </div>
    </footer>
  );
}