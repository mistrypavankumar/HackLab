'use client';

const KEY = 'hacklab:completed';

export function getCompleted(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function isCompleted(slug: string): boolean {
  return getCompleted().includes(slug);
}

export function toggleCompleted(slug: string): string[] {
  const current = new Set(getCompleted());
  if (current.has(slug)) current.delete(slug);
  else current.add(slug);
  const next = [...current];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
