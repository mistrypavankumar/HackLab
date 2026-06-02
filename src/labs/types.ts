import type { ComponentType } from 'react';

export type Category = 'frontend' | 'backend' | 'auth' | 'misconfig';
export type Difficulty = 'basic' | 'intermediate';

export const CATEGORY_LABELS: Record<Category, string> = {
  frontend: 'Frontend / Client-side',
  backend: 'Backend / Server-side',
  auth: 'Auth & Session',
  misconfig: 'Secrets & Misconfiguration',
};

export interface LabMeta {
  slug: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  summary: string;
  /** The vulnerable implementation, shown in the code panel. */
  vulnerableCode: string;
  /** The secure implementation, shown side-by-side. */
  secureCode: string;
  /** Why the vulnerability works. */
  why: string;
  /** How a developer can spot this in their own codebase. */
  detect: string;
  /** Quick self-check items. */
  checklist: string[];
}

export interface Lab {
  meta: LabMeta;
  Component: ComponentType;
}

/** Mode shared by every interactive lab + its API routes. */
export type LabMode = 'vulnerable' | 'secure';
