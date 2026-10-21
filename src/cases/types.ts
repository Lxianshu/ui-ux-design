export type Category = 'ui' | 'ux';
export type Platform = 'web' | 'desktop' | 'miniapp' | 'h5' | 'app';
export type DemoId =
  | 'launch'
  | 'progress'
  | 'upload'
  | 'message'
  | 'ride'
  | 'skeleton'
  | 'image'
  | 'pagination'
  | 'stream';
export type SimulationStatus = 'idle' | 'running' | 'success' | 'error' | 'cancelled';

export type CasePreview =
  | { kind: 'code'; demoId: DemoId }
  | { kind: 'video'; src: string; poster?: string; captions?: string; description: string };

export interface CaseDefinition {
  id: string;
  slug: string;
  category: Category;
  title: string;
  englishTitle: string;
  summary: string;
  oneLiner: string;
  tags: string[];
  effects: string[];
  styleTags: string[];
  visualStyle: string;
  principle: string;
  scenario: string;
  platforms: Platform[];
  preview: CasePreview;
  parameters: { durationMs: number };
  states: string[];
  prompt: string;
  implementationNotes: string;
  acceptanceCriteria: string[];
  accessibilityNotes: string;
}

export interface PromptOptions {
  platform: Platform;
  durationMs: number;
  simulateFailure: boolean;
}
