import type { LabMeta } from '../types';

export const meta: LabMeta = {
  slug: 'stored-xss',
  title: 'Stored Cross-Site Scripting (XSS)',
  category: 'frontend',
  difficulty: 'basic',
  summary:
    'A comment board stores whatever you submit and renders it as raw HTML — so a comment can run JavaScript in every visitor’s browser.',
  vulnerableCode: `// Server returns the comment body untouched...
return Response.json({ comments }); // body: "<img src=x onerror=...>"

// ...and the client injects it as raw HTML.
<div dangerouslySetInnerHTML={{ __html: comment.body }} />`,
  secureCode: `import { escapeHtml } from '@/lib/sanitize';

// Encode on output so markup renders as inert text.
const safe = comments.map((c) => ({ ...c, body: escapeHtml(c.body) }));
return Response.json({ comments: safe });

// (Even better: render as text — {comment.body} — and never use
// dangerouslySetInnerHTML for user-controlled content.)`,
  why: 'The app treats user input as trusted markup. Because the payload is stored, every viewer who loads the page executes the attacker’s script — enabling session theft, defacement, or actions on the victim’s behalf.',
  detect: 'Search for dangerouslySetInnerHTML, .innerHTML =, v-html, or any template that interpolates user data into HTML without encoding. Any user-controlled string reaching the DOM as markup is a candidate.',
  checklist: [
    'Output-encode user data for the context it lands in (HTML, attribute, JS, URL).',
    'Avoid dangerouslySetInnerHTML / innerHTML for anything user-controlled.',
    'Add a Content-Security-Policy as defense-in-depth.',
    'Sanitize rich text with a vetted library (DOMPurify) when HTML is required.',
  ],
};
