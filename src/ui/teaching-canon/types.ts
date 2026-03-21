/** Tipos locales para placeholders de audio/imagen (sin depender de otros módulos). */

export interface CanonAudioPlaceholder {
  eyebrow: string;
  title: string;
  summary: string;
  scriptIntent: string;
  durationLabel?: string;
}

export interface CanonImagePlaceholder {
  label: string;
  title: string;
  prompt: string;
  aspectRatio?: '16:9' | '4:5' | '1:1';
}
