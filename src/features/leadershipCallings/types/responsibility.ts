/**
 * Responsibility Types for Leadership Module
 * 
 * Responsibilities are tasks/duties assigned to a calling.
 * Status tracking is simple: pending → in_progress → done
 * NO counters, NO percentages, NO urgency levels.
 */

export type ResponsibilityStatus = 'pending' | 'in_progress' | 'done';

// Only low/medium priority - no "high" or "urgent" to avoid pressure culture
export type ResponsibilityPriority = 'low' | 'medium';

export interface Responsibility {
  id: string;
  callingId: string;
  title: string;
  description?: string;
  status: ResponsibilityStatus;
  priority: ResponsibilityPriority;
  suggestedDate?: string;     // ISO date - optional, not a deadline
  completedAt?: string;       // ISO date
  notes?: string;             // Brief update note
  createdAt: string;          // ISO date
  updatedAt: string;          // ISO date
}

export interface ResponsibilityFormData {
  callingId: string;
  title: string;
  description?: string;
  priority: ResponsibilityPriority;
  suggestedDate?: string;
}

// UI helper for status display
export const RESPONSIBILITY_STATUS_LABELS: Record<ResponsibilityStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Completado',
};

// UI helper for priority display (calm language)
export const RESPONSIBILITY_PRIORITY_LABELS: Record<ResponsibilityPriority, string> = {
  low: 'Baja',
  medium: 'Media',
};
