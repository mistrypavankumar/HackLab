import Link from 'next/link';
import { ChallengeList } from '@/recon/ChallengeList';
import { CheatsheetTabs } from '@/recon/CheatsheetTabs';
import { ReconTerminal } from '@/recon/ReconTerminal';
import { cheatsheet } from '@/recon/cheatsheet';

export const metadata = {
  title: 'Code Recon — grep, find & ripgrep | HackLab',
};

export default function ReconPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← all labs
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Code Recon: <span className="text-accent">grep, find & ripgrep</span>
        </h1>
        <p className="max-w-2xl text-zinc-400">
          Searching a codebase fast is the core skill behind finding hardcoded
          secrets, dangerous functions, and leaked data. Learn the commands
          below, then practice them against the planted{' '}
          <code className="text-zinc-300">practice-target/</code> folder in your
          real terminal.
        </p>
        <div className="rounded-lg border border-border bg-panel p-4 text-sm text-zinc-400">
          <strong className="text-zinc-200">Setup:</strong> open a terminal at the
          project root (<code className="text-zinc-300">hacklab/</code>). Every
          challenge command runs against{' '}
          <code className="text-zinc-300">practice-target/</code>, a small sample
          codebase deliberately seeded with security findings.
        </div>
      </header>

      {/* In-browser practice terminal */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-200">Practice terminal</h2>
          <span className="text-xs text-zinc-500">runs in your browser · no real shell</span>
        </div>
        <p className="text-sm text-zinc-400">
          Type real <code className="text-zinc-300">grep</code> /{' '}
          <code className="text-zinc-300">find</code> /{' '}
          <code className="text-zinc-300">rg</code> commands here — they search a
          sandboxed virtual copy of <code className="text-zinc-300">practice-target/</code>.
          Use ↑/↓ for history.
        </p>
        <ReconTerminal />
      </section>

      {/* Cheatsheet */}
      <section className="space-y-5">
        <h2 className="text-xl font-semibold text-zinc-200">Cheatsheet</h2>
        <CheatsheetTabs sections={cheatsheet} />
      </section>

      {/* Challenges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-200">Practice challenges</h2>
        <p className="text-sm text-zinc-400">
          Try each one yourself first. Reveal the hint if stuck, the command to
          check your approach, and the expected finding to confirm.
        </p>
        <ChallengeList />
      </section>
    </div>
  );
}
