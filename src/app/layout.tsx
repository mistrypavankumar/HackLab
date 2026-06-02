import type { Metadata } from 'next';
import Link from 'next/link';
import { SafetyBanner } from '@/components/SafetyBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'HackLab — Learn Web Security by Breaking It',
  description:
    'Hands-on, localhost-only labs that teach developers how common web vulnerabilities work — and how to fix them.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // suppressHydrationWarning: browser extensions inject data-* attributes onto
  // <html> before hydration, which would otherwise warn. Scoped to this
  // element's own attributes only.
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SafetyBanner />
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Hack<span className="text-accent">Lab</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-zinc-400 hover:text-zinc-200">
                Labs
              </Link>
              <Link href="/recon" className="text-zinc-400 hover:text-zinc-200">
                Code Recon
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
