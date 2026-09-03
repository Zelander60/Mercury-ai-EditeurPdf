import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar/navbar';

export const metadata: Metadata = {
  title: {
    default: 'BookGenerator — AI-Powered Book & Document Creation',
    template: '%s | BookGenerator',
  },
  description:
    'Generate professional books, e-books, and documents with AI. Choose from 15+ genres, get beautiful covers, and export as print-ready PDF in seconds.',
  keywords: [
    'AI book generator',
    'e-book creator',
    'PDF generator',
    'AI writing tool',
    'book maker online',
    'self-publishing',
    'document generator',
    'AI content creation',
  ],
  openGraph: {
    title: 'BookGenerator — Generate Professional Books with AI',
    description:
      'Transform your ideas into beautifully formatted books. AI generates the content, you own the result. Export as print-ready PDF.',
    type: 'website',
    locale: 'en_US',
    siteName: 'BookGenerator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookGenerator — AI-Powered Book Creation',
    description:
      'Generate professional books and e-books with AI. 15+ genres, beautiful covers, instant PDF export.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
