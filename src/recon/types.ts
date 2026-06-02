export interface CheatItem {
  cmd: string;
  desc: string;
  /** A concrete, runnable example — most are scoped to practice-target/. */
  example: string;
}

export interface CheatSection {
  /** Short label for the tab. */
  tab: string;
  title: string;
  items: CheatItem[];
}

export interface Challenge {
  id: number;
  difficulty: 'basic' | 'intermediate';
  goal: string;
  /** A nudge toward the right flags, without giving the command away. */
  hint: string;
  /** The full command to run (revealed on demand). */
  command: string;
  /** What you should see / which planted finding it surfaces. */
  finding: string;
}
