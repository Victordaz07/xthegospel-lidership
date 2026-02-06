/**
 * Calling Types for Leadership Module
 * 
 * Note: This is for WARD/STAKE leadership managing callings,
 * NOT missionary KPIs. No metrics, no surveillance.
 */

export type CallingStatus = 'proposed' | 'called' | 'sustained' | 'set_apart' | 'active' | 'released';

export type OrganizationType = 
  | 'bishopric'
  | 'elders_quorum'
  | 'relief_society'
  | 'young_women'
  | 'young_men'
  | 'primary'
  | 'sunday_school'
  | 'ward_mission'
  | 'other';

export interface CallingTimeline {
  proposedAt?: string;      // ISO date
  calledAt?: string;        // ISO date
  sustainedAt?: string;     // ISO date
  setApartAt?: string;      // ISO date (or "authorizedAt" for some callings)
  releasedAt?: string;      // ISO date
}

export interface Calling {
  id: string;
  memberId: string;
  memberName: string;
  organization: OrganizationType;
  position: string;           // e.g., "President", "First Counselor", "Teacher"
  status: CallingStatus;
  timeline: CallingTimeline;
  notes?: string;             // Initial notes when proposing
  createdAt: string;          // ISO date
  updatedAt: string;          // ISO date
}

export interface CallingFormData {
  memberId: string;
  memberName: string;
  organization: OrganizationType;
  position: string;
  proposedDate?: string;
  notes?: string;
}

// UI helper for organization display
export const ORGANIZATION_LABELS: Record<OrganizationType, string> = {
  bishopric: 'Obispado',
  elders_quorum: 'Cuórum de Élderes',
  relief_society: 'Sociedad de Socorro',
  young_women: 'Mujeres Jóvenes',
  young_men: 'Hombres Jóvenes',
  primary: 'Primaria',
  sunday_school: 'Escuela Dominical',
  ward_mission: 'Misión del Barrio',
  other: 'Otro',
};

// UI helper for status display (calm language)
export const STATUS_LABELS: Record<CallingStatus, string> = {
  proposed: 'Propuesto',
  called: 'Llamado',
  sustained: 'Sostenido',
  set_apart: 'Apartado',
  active: 'Activo',
  released: 'Relevado',
};
