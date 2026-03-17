/**
 * Import Baptism Preparation - Parse & Normalize
 * Validates JSON with Zod, normalizes to Firestore structure
 */

import {
  BaptismPreparationSchema,
  BaptismAgendaStandaloneSchema,
  FullExportPayloadSchema,
  type BaptismPreparationImport,
  type ParseResult,
  type DataSummary,
  DATA_VERSION,
  type DataVersion,
} from '../types';

const TESTIMONY_PREVIEW_MAX = 500;
const TESTIMONY_FULL_MAX = 10_000; // 10KB chars

/**
 * Parse file and validate schema.
 * Accepts: full export (baptismPreparation), agenda standalone (agenda + exportedAt).
 * If no schemaVersion, treats as bp-v1.
 */
export async function parseBaptismPreparationFile(
  file: File
): Promise<ParseResult> {
  try {
    const text = await file.text();
    const raw = JSON.parse(text) as unknown;

    // Try full export first
    const fullResult = FullExportPayloadSchema.safeParse(raw);
    if (fullResult.success && fullResult.data.baptismPreparation) {
      const bp = BaptismPreparationSchema.parse(fullResult.data.baptismPreparation);
      const sourceExportedAt =
        fullResult.data.exportedAt ?? new Date().toISOString();
      const dataVersion = (fullResult.data.schemaVersion as DataVersion) ?? DATA_VERSION;
      return {
        success: true,
        data: bp as BaptismPreparationImport,
        sourceExportedAt,
        dataVersion: dataVersion === 'bp-v2' ? 'bp-v2' : 'bp-v1',
      };
    }

    // Try agenda standalone
    const agendaResult = BaptismAgendaStandaloneSchema.safeParse(raw);
    if (agendaResult.success) {
      const data: BaptismPreparationImport = {
        completedChecklist: {},
        baptismDate: agendaResult.data.baptismDate,
        location: agendaResult.data.location,
        agendaProgram: agendaResult.data.agenda,
      };
      return {
        success: true,
        data,
        sourceExportedAt: agendaResult.data.exportedAt,
        dataVersion: 'bp-v1',
      };
    }

    // Try raw baptismPreparation at top level
    const bpResult = BaptismPreparationSchema.safeParse(raw);
    if (bpResult.success) {
      const exportedAt = typeof raw === 'object' && raw !== null && 'exportedAt' in raw
        ? String((raw as { exportedAt?: string }).exportedAt ?? new Date().toISOString())
        : new Date().toISOString();
      return {
        success: true,
        data: bpResult.data as BaptismPreparationImport,
        sourceExportedAt: exportedAt,
        dataVersion: 'bp-v1',
      };
    }

    const errors = [fullResult, agendaResult, bpResult]
      .filter((r) => !r.success)
      .map((r) => (r as { error: { message?: string } }).error?.message ?? 'Unknown');
    return { success: false, error: errors.join('; ') };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: `Error al parsear: ${msg}` };
  }
}

/**
 * Normalize parsed data to Firestore structure.
 * Always produces dataSummary + testimonyPreview + meta.
 * testimonyFull only if within limit.
 */
export function normalizeToStored(
  data: BaptismPreparationImport,
  sourceExportedAt: string,
  dataVersion: DataVersion
): {
  dataSummary: DataSummary;
  testimonyPreview: string;
  testimonyFull?: string;
} {
  const testimony = (data.personalTestimony ?? '').trim();
  const testimonyPreview = testimony.slice(0, TESTIMONY_PREVIEW_MAX);
  const testimonyFull =
    testimony.length > TESTIMONY_PREVIEW_MAX && testimony.length <= TESTIMONY_FULL_MAX
      ? testimony
      : testimony.length > TESTIMONY_FULL_MAX
        ? testimony.slice(0, TESTIMONY_FULL_MAX)
        : undefined;

  const dataSummary: DataSummary = {
    milestones: data.milestones,
    baptismDate: data.baptismDate,
    location: data.location,
    performedBy: data.performedBy,
    guests: data.guests,
    agendaProgram: data.agendaProgram,
  };

  return {
    dataSummary,
    testimonyPreview,
    ...(testimonyFull && { testimonyFull }),
  };
}
