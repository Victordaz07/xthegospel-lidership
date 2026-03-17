/**
 * Baptism Preparation - Types & Zod Schemas
 * Compatible with investigator export (App-Avanzada-Misional)
 * Schemas: bp-v1, bp-v2
 */

import { z } from 'zod';

// ============================================================================
// SCHEMA VERSIONS
// ============================================================================

export const DATA_VERSION = 'bp-v1' as const;
export type DataVersion = 'bp-v1' | 'bp-v2';

// ============================================================================
// AGENDA PROGRAM
// ============================================================================

export const AgendaProgramSchema = z.object({
  confirmImmediately: z.boolean().default(false),
  speakerName: z.string().optional(),
  openingPrayerBy: z.string().optional(),
  closingPrayerBy: z.string().optional(),
  hymn1: z.string().optional(),
  hymn2: z.string().optional(),
  hymn3: z.string().optional(),
});

export type AgendaProgram = z.infer<typeof AgendaProgramSchema>;

// ============================================================================
// MILESTONES (progress bar)
// ============================================================================

export const MilestonesSchema = z.object({
  restoration: z.boolean().default(false),
  planOfSalvation: z.boolean().default(false),
  gospelOfJesusChrist: z.boolean().default(false),
  commandments: z.boolean().default(false),
  churchAttendance: z.boolean().default(false),
  interview: z.boolean().default(false),
  dateScheduled: z.boolean().default(false),
});

export type Milestones = z.infer<typeof MilestonesSchema>;

// ============================================================================
// BAPTISM PREPARATION (full export from investigator)
// ============================================================================

export const BaptismPreparationSchema = z.object({
  completedChecklist: z.record(z.string(), z.boolean()).optional().default({}),
  baptismDate: z.string().optional(),
  location: z.string().optional(),
  performedBy: z.string().optional(),
  guests: z.string().optional(),
  personalTestimony: z.string().optional(),
  agendaProgram: AgendaProgramSchema.optional(),
  milestones: MilestonesSchema.optional(),
});

export type BaptismPreparationImport = z.infer<typeof BaptismPreparationSchema>;

// ============================================================================
// AGENDA STANDALONE (exportBaptismAgenda)
// ============================================================================

export const BaptismAgendaStandaloneSchema = z.object({
  baptismDate: z.string().optional(),
  location: z.string().optional(),
  agenda: AgendaProgramSchema.optional(),
  exportedAt: z.string(),
  schemaVersion: z.string().optional(),
});

export type BaptismAgendaStandalone = z.infer<typeof BaptismAgendaStandaloneSchema>;

// ============================================================================
// FULL EXPORT PAYLOAD (gatherExportData)
// ============================================================================

export const FullExportPayloadSchema = z.object({
  baptismPreparation: BaptismPreparationSchema.optional(),
  exportedAt: z.string().optional(),
  schemaVersion: z.string().optional(),
});

export type FullExportPayload = z.infer<typeof FullExportPayloadSchema>;

// ============================================================================
// NORMALIZED DATA (stored in Firestore)
// ============================================================================

export interface DataSummary {
  milestones?: Milestones;
  baptismDate?: string;
  location?: string;
  performedBy?: string;
  guests?: string;
  agendaProgram?: AgendaProgram;
}

export interface ImportHistoryEntry {
  sourceExportedAt: string;
  lastImportedAt: string;
  importedBy: string;
  dataVersion: DataVersion;
}

export interface LeaderFeedback {
  content: string;
  updatedAt: string;
  updatedBy: string;
}

/** Entrada de auditoría del feedback (máx 5) */
export interface FeedbackHistoryEntry {
  contentPreview: string; // primeros 80 chars
  updatedAt: string;
  updatedBy: string;
}

export interface BaptismPreparationStored {
  dataVersion: DataVersion;
  sourceExportedAt: string;
  lastImportedAt: string;
  importedBy: string;
  dataSummary: DataSummary;
  testimonyPreview: string;
  testimonyFull?: string;
  leaderFeedback?: LeaderFeedback;
  feedbackHistory?: FeedbackHistoryEntry[];
  importHistory: ImportHistoryEntry[];
  lastSeenByLeaderAt?: string;
  lastSeenByLeaderUid?: string;
}

// ============================================================================
// PARSE RESULT
// ============================================================================

export interface ParseSuccess {
  success: true;
  data: BaptismPreparationImport;
  sourceExportedAt: string;
  dataVersion: DataVersion;
}

export interface ParseError {
  success: false;
  error: string;
}

export type ParseResult = ParseSuccess | ParseError;
