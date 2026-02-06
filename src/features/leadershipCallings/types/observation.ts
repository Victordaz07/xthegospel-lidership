/**
 * Observation Types for Calling Progress
 * 
 * Observations are DESCRIPTIVE notes about a calling's progress.
 * NO metrics, NO scores, NO percentages.
 * Just narrative updates that describe what's happening.
 */

export interface Observation {
  id: string;
  callingId: string;
  content: string;            // Descriptive text
  milestone?: string;         // Optional milestone label (e.g., "Completed training")
  createdAt: string;          // ISO date
}

export interface ObservationFormData {
  callingId: string;
  content: string;
  milestone?: string;
}

// Common milestones (suggestions only, not required)
export const COMMON_MILESTONES = [
  'Comenzó capacitación',
  'Completó capacitación',
  'Primera reunión de consejo',
  'Familiarizado con responsabilidades',
  'Trabajando de forma independiente',
  'Necesita apoyo adicional',
  'Transición suave',
] as const;
