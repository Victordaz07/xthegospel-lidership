/**
 * Teaching Analytics Service
 *
 * Métricas e insights a nivel barrio. Fase 6.
 * Detección de problemas: sesiones con bajo engagement, sesiones olvidadas.
 */

import { listSessionsForWard } from './teachingSessionsService';
import { buildSessionReport } from './sessionReportService';

export interface WardTeachingStatsRange {
  from: number;
  to: number;
}

export interface LowAttendanceSession {
  sessionId: string;
  title: string;
  attendance: number;
  avgCompletionPct: number;
}

export interface StaleActiveSession {
  sessionId: string;
  title: string;
  teacherDisplayName?: string;
  hoursOpen: number;
}

export interface TopLowCompletionPart {
  partTitle: string;
  sessionId: string;
  sessionTitle: string;
  pct: number;
}

export interface WardTeachingStats {
  totalSessions: number;
  avgAttendancePct: number;
  avgCompletionPct: number;
  lowAttendanceSessions: LowAttendanceSession[];
  staleActiveSessions: StaleActiveSession[];
  topLowCompletionParts: TopLowCompletionPart[];
}

const MS_PER_HOUR = 60 * 60 * 1000;

export async function getWardTeachingStats(
  wardId: string,
  range?: WardTeachingStatsRange
): Promise<WardTeachingStats> {
  const now = Date.now();
  const defaultDays = 30;
  const from = range?.from ?? now - defaultDays * 24 * MS_PER_HOUR;
  const to = range?.to ?? now;

  const daysBack = Math.ceil((to - from) / (24 * MS_PER_HOUR));
  const sessions = await listSessionsForWard(wardId, {
    limit: 100,
    daysBack,
  });

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const activeSessions = sessions.filter((s) => s.status === 'active');

  const reports: Awaited<ReturnType<typeof buildSessionReport>>[] = [];
  for (const s of completedSessions) {
    try {
      const report = await buildSessionReport(wardId, s.id);
      reports.push(report);
    } catch {
      // skip sessions that fail (e.g. deleted)
    }
  }

  const totalSessions = completedSessions.length;
  const avgCompletionPct =
    reports.length === 0
      ? 0
      : Math.round(
          reports.reduce((acc, r) => acc + r.avgCompletionPct, 0) / reports.length
        );

  const maxAttendance = Math.max(...reports.map((r) => r.attendance), 1);
  const avgAttendanceCount = reports.length === 0 ? 0 : reports.reduce((acc, r) => acc + r.attendance, 0) / reports.length;
  const avgAttendancePct = Math.round((avgAttendanceCount / maxAttendance) * 100);

  const lowAttendanceSessions: LowAttendanceSession[] = reports
    .filter((r) => r.avgCompletionPct < 50)
    .map((r) => ({
      sessionId: r.sessionId,
      title: r.title,
      attendance: r.attendance,
      avgCompletionPct: r.avgCompletionPct,
    }))
    .sort((a, b) => a.avgCompletionPct - b.avgCompletionPct)
    .slice(0, 10);

  const staleActiveSessions: StaleActiveSession[] = activeSessions
    .filter((s) => {
      const hours = (now - s.updatedAt) / MS_PER_HOUR;
      return hours > 24;
    })
    .map((s) => ({
      sessionId: s.id,
      title: s.title,
      teacherDisplayName: s.teacherDisplayName,
      hoursOpen: Math.round((now - s.updatedAt) / MS_PER_HOUR),
    }))
    .sort((a, b) => b.hoursOpen - a.hoursOpen);

  const partCompletionMap = new Map<string, { total: number; completed: number; sessionId: string; sessionTitle: string; partTitle: string }>();
  for (const r of reports) {
    for (const p of r.parts) {
      const key = `${r.sessionId}-${p.id}`;
      partCompletionMap.set(key, {
        total: p.total,
        completed: p.completed,
        sessionId: r.sessionId,
        sessionTitle: r.title,
        partTitle: p.title,
      });
    }
  }

  const partPcts = Array.from(partCompletionMap.entries()).map(([_, v]) => ({
    ...v,
    pct: v.total === 0 ? 0 : Math.round((v.completed / v.total) * 100),
  }));

  const topLowCompletionParts: TopLowCompletionPart[] = partPcts
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .map((p) => ({
      partTitle: p.partTitle,
      sessionId: p.sessionId,
      sessionTitle: p.sessionTitle,
      pct: p.pct,
    }));

  return {
    totalSessions,
    avgAttendancePct,
    avgCompletionPct,
    lowAttendanceSessions,
    staleActiveSessions,
    topLowCompletionParts,
  };
}
