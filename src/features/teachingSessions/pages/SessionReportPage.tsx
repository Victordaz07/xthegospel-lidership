/**
 * Session Report Page
 *
 * Reporte final de sesión: asistencia, progreso por parte, participantes.
 * Export PDF. Fase 4.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useWardStore } from '../../../state/ward/useWardStore';
import { buildSessionReport, type SessionReport } from '../services/sessionReportService';
import { PageShell, Card, Button, SectionTitle } from '../../../ui';

// @ts-ignore - jspdf types may be missing
import jsPDF from 'jspdf';

const CALLING_LABELS: Record<string, string> = {
  sunday_school: 'Escuela Dominical',
  seminary: 'Seminario',
  quorum: 'Quórum',
  relief_society: 'Sociedad de Socorro',
  primary: 'Primaria',
  other: 'Otro',
};

function safeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'reporte';
}

function exportToPdf(report: SessionReport): void {
  const doc = new jsPDF();
  let y = 14;

  doc.setFontSize(16);
  doc.text(`Reporte de Clase: ${report.title}`, 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date(report.createdAt).toLocaleDateString('es')}`, 14, y);
  y += 6;
  if (report.teacherDisplayName) {
    doc.text(`Maestro: ${report.teacherDisplayName}`, 14, y);
    y += 6;
  }
  doc.text(`Asistencia: ${report.attendance}`, 14, y);
  y += 6;
  doc.text(`Promedio completado: ${report.avgCompletionPct}%`, 14, y);
  y += 12;

  doc.setFontSize(12);
  doc.text('Progreso por parte', 14, y);
  y += 8;

  doc.setFontSize(10);
  report.parts.forEach((p) => {
    doc.text(`${p.title}: ${p.completed}/${p.total}`, 14, y);
    y += 6;
  });
  y += 4;

  doc.line(10, y - 4, 200, y - 4);
  y += 10;

  doc.setFontSize(12);
  doc.text('Participantes', 14, y);
  y += 8;

  doc.setFontSize(10);
  report.participants.forEach((p) => {
    doc.text(`- ${p.displayName}: ${p.completedPartsCount} partes`, 14, y);
    y += 6;
  });

  if (report.feedback?.count && report.feedback.count > 0) {
    y += 8;
    doc.line(10, y - 4, 200, y - 4);
    y += 10;
    doc.setFontSize(12);
    doc.text('Feedback', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Promedio: ${report.feedback.avgRating.toFixed(1)} (${report.feedback.count} respuestas)`, 14, y);
    y += 8;
    report.feedback.comments.slice(0, 5).forEach((c) => {
      doc.text(`- ${c}`, 14, y);
      y += 6;
    });
  }

  doc.save(`reporte-${safeSlug(report.title)}.pdf`);
}

const SessionReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { membership } = useWardStore();
  const fromBishop = location.pathname.includes('/bishop/teaching');
  const backTo = fromBishop ? '/bishop/teaching' : '/teaching';
  const [report, setReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wardId = membership?.wardId;

  useEffect(() => {
    if (!wardId || !sessionId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    buildSessionReport(wardId, sessionId)
      .then(setReport)
      .catch((err) => setError((err as Error)?.message ?? 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [wardId, sessionId]);

  if (!wardId || !sessionId) {
    return (
      <PageShell title="Reporte" onBack={() => navigate(backTo)} variant="gradient">
        <Card variant="default" padding="lg">
          <p>Parámetros inválidos.</p>
        </Card>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Reporte" onBack={() => navigate(backTo)} variant="gradient">
        <Card variant="default" padding="lg">
          <p>Cargando reporte...</p>
        </Card>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Reporte" onBack={() => navigate(backTo)} variant="gradient">
        <Card variant="default" padding="lg">
          <p>Error cargando el reporte.</p>
          <p style={{ fontSize: 14, color: 'var(--am-color-text-muted)', marginTop: 8 }}>{error}</p>
          <div style={{ marginTop: 16 }}>
            <Button variant="secondary" onClick={() => navigate(backTo)}>
              Volver al listado
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  if (!report) {
    return (
      <PageShell title="Reporte" onBack={() => navigate(backTo)} variant="gradient">
        <Card variant="default" padding="lg">
          <p>No se encontró el reporte.</p>
          <div style={{ marginTop: 16 }}>
            <Button variant="secondary" onClick={() => navigate(backTo)}>
              Volver al listado
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  const callingLabel = CALLING_LABELS[report.callingType] ?? report.callingType;

  return (
    <PageShell
      title="Reporte de sesión"
      onBack={() => navigate(backTo)}
      variant="gradient"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <Card variant="default" padding="lg">
          <h2 style={{ margin: '0 0 8px 0', fontSize: 20 }}>{report.title}</h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--am-color-text-muted)' }}>
            {callingLabel}
            {report.teacherDisplayName && ` · ${report.teacherDisplayName}`}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--am-color-text-muted)' }}>
            {new Date(report.createdAt).toLocaleDateString('es')}
          </p>
        </Card>

        <Card variant="default" padding="lg">
          <SectionTitle>Resumen</SectionTitle>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>Asistencia total</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{report.attendance}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>Promedio completado</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{report.avgCompletionPct}%</div>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <SectionTitle>Progreso por parte</SectionTitle>
          {report.parts.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--am-color-text-muted)', margin: 0 }}>Sin partes.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {report.parts.map((p) => (
                <li
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--am-color-border, #e2e8f0)',
                  }}
                >
                  <span>{p.title}</span>
                  <span style={{ fontWeight: 600 }}>{p.completed} / {p.total}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {report.feedback && report.feedback.count > 0 && (
          <Card variant="default" padding="lg">
            <SectionTitle>Feedback</SectionTitle>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>Promedio</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>⭐ {report.feedback.avgRating.toFixed(1)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>Respuestas</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{report.feedback.count}</div>
              </div>
            </div>
            {report.feedback.comments.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)', marginBottom: 8 }}>Comentarios</div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {report.feedback.comments.map((c, i) => (
                    <li
                      key={i}
                      style={{
                        padding: '8px 0',
                        borderBottom: '1px solid var(--am-color-border, #e2e8f0)',
                        fontSize: 14,
                      }}
                    >
                      "{c}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        <Card variant="default" padding="lg">
          <SectionTitle>Participantes ({report.participants.length})</SectionTitle>
          {report.participants.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--am-color-text-muted)', margin: 0 }}>Sin participantes.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {report.participants.map((p) => (
                <li
                  key={p.uid}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--am-color-border, #e2e8f0)',
                  }}
                >
                  <span>{p.displayName}</span>
                  <span style={{ color: 'var(--am-color-text-muted)' }}>{p.completedPartsCount} partes</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => exportToPdf(report)}>
            Exportar PDF
          </Button>
          <Button variant="secondary" onClick={() => navigate(backTo)}>
            Volver al listado
          </Button>
        </div>
      </div>
    </PageShell>
  );
};

export default SessionReportPage;
