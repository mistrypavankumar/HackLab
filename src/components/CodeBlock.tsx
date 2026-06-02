import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  code: string;
  lang?: string;
  title?: string;
  tone?: 'danger' | 'accent';
}

// Server component: highlights code at render time with Shiki.
export async function CodeBlock({ code, lang = 'ts', title, tone }: CodeBlockProps) {
  const html = await codeToHtml(code.trim(), {
    lang,
    theme: 'github-dark',
  });

  const ring =
    tone === 'danger'
      ? 'border-danger/40'
      : tone === 'accent'
        ? 'border-accent/40'
        : 'border-border';

  return (
    <div className={`overflow-hidden rounded-lg border ${ring} bg-panel`}>
      {title && (
        <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {title}
        </div>
      )}
      <div
        className="overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
