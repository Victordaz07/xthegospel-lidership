/**
 * Check if investigator is ready for baptism (leader view).
 * Mirrors logic from App-Avanzada-Misional useBaptismProgressStore.
 * Uses dataSummary (milestones + testimonyPreview/testimonyFull).
 */

import type { DataSummary, Milestones } from '../types';

export function isReadyForBaptism(stored: {
  dataSummary: DataSummary;
  testimonyPreview: string;
  testimonyFull?: string;
}): boolean {
  const { dataSummary, testimonyPreview, testimonyFull } = stored;
  const m = dataSummary?.milestones as Milestones | undefined;
  if (!m) return false;

  const testimonyLen = testimonyFull
    ? testimonyFull.length
    : (testimonyPreview?.length ?? 0);
  const testimonyOk = testimonyLen >= 40;

  return (
    Boolean(m.restoration) &&
    Boolean(m.planOfSalvation) &&
    Boolean(m.gospelOfJesusChrist) &&
    Boolean(m.commandments) &&
    Boolean(m.churchAttendance) &&
    Boolean(m.interview) &&
    testimonyOk
  );
}

/** Pending milestones for display */
export function getPendingMilestones(stored: {
  dataSummary: DataSummary;
  testimonyPreview: string;
  testimonyFull?: string;
}): string[] {
  const { dataSummary, testimonyPreview, testimonyFull } = stored;
  const m = (dataSummary?.milestones ?? {}) as Milestones;
  const pending: string[] = [];

  const labels: Record<string, string> = {
    restoration: 'Restauración',
    planOfSalvation: 'Plan de Salvación',
    gospelOfJesusChrist: 'Evangelio de Jesucristo',
    commandments: 'Mandamientos',
    churchAttendance: 'Iglesia',
    interview: 'Entrevista',
    dateScheduled: 'Fecha',
  };

  if (!m.restoration) pending.push(labels.restoration);
  if (!m.planOfSalvation) pending.push(labels.planOfSalvation);
  if (!m.gospelOfJesusChrist) pending.push(labels.gospelOfJesusChrist);
  if (!m.commandments) pending.push(labels.commandments);
  if (!m.churchAttendance) pending.push(labels.churchAttendance);
  if (!m.interview) pending.push(labels.interview);

  const testimonyLen = testimonyFull
    ? testimonyFull.length
    : (testimonyPreview?.length ?? 0);
  if (testimonyLen < 40) pending.push('Compromiso (testimonio ≥ 40 caracteres)');

  return pending;
}
