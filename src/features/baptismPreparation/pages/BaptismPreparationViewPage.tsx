/**
 * Baptism Preparation View Page
 * Leader sees imported preparation, staleness, feedback area
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useWardStore } from '../../../state/ward/useWardStore';
import {
  getBaptismPreparation,
  saveBaptismPreparation,
  updateLeaderFeedback,
  touchLastSeenByLeader,
  isStale as checkStale,
  buildSaveInput,
} from '../services/baptismPreparationFirestore';
import { parseBaptismPreparationFile } from '../services/importBaptismPreparation';
import { isReadyForBaptism, getPendingMilestones } from '../utils/isReadyForBaptism';
import type { BaptismPreparationStored } from '../types';
import { PageShell, Card, Button, SectionTitle } from '../../../ui';
import { FaFileImport, FaTriangleExclamation, FaCopy } from 'react-icons/fa6';

const BaptismPreparationViewPage: React.FC = () => {
  const { id: memberId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { membership } = useWardStore();
  const wardId = membership?.wardId;

  const [data, setData] = useState<BaptismPreparationStored | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!wardId || !memberId) {
      setLoading(false);
      return;
    }
    getBaptismPreparation(wardId, memberId)
      .then((d) => {
        setData(d);
        setFeedbackContent(d?.leaderFeedback?.content ?? '');
        if (d && user?.uid) {
          touchLastSeenByLeader(wardId, memberId, user.uid).catch(() => {});
        }
      })
      .catch((err) => setError(err?.message ?? 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [wardId, memberId, user?.uid]);

  const stale = data ? checkStale(data.sourceExportedAt) : false;
  const ready = data ? isReadyForBaptism(data) : false;
  const pending = data ? getPendingMilestones(data) : [];

  const copySummaryToClipboard = () => {
    if (!data) return;
    const lastImport = new Date(data.lastImportedAt).toISOString().split('T')[0];
    const pendingStr = pending.length > 0 ? pending.join(', ') : '—';
    const staleStr = stale ? 'Sí (>7d)' : 'No';
    const staleNote = stale ? ' | Nota: Reimportar JSON' : '';
    const oneLiner = `Bautismo — Listo: ${ready ? 'Sí' : 'No'} | Pendiente: ${pendingStr} | Última importación: ${lastImport} | Desactualizado: ${staleStr}${staleNote}`;
    navigator.clipboard.writeText(oneLiner).then(
      () => alert('Resumen copiado al portapapeles'),
      () => alert('No se pudo copiar')
    );
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !wardId || !memberId || !user?.uid) return;

    setImporting(true);
    setError(null);
    try {
      const result = await parseBaptismPreparationFile(file);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const input = buildSaveInput(result.data, result.sourceExportedAt, result.dataVersion);
      await saveBaptismPreparation(wardId, memberId, input, user.uid);
      const updated = await getBaptismPreparation(wardId, memberId);
      setData(updated);
    } catch (err) {
      setError((err as Error)?.message ?? 'Error al importar');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleSaveFeedback = async () => {
    if (!wardId || !memberId || !user?.uid) return;

    setSavingFeedback(true);
    setError(null);
    try {
      await updateLeaderFeedback(wardId, memberId, feedbackContent, user.uid);
      const updated = await getBaptismPreparation(wardId, memberId);
      setData(updated);
    } catch (err) {
      setError((err as Error)?.message ?? 'Error al guardar');
    } finally {
      setSavingFeedback(false);
    }
  };

  if (!wardId || !memberId) {
    return (
      <PageShell title="Preparación bautismal" onBack={() => navigate(-1)} variant="gradient">
        <Card variant="default" padding="md">
          <p style={{ textAlign: 'center', color: 'var(--am-color-text-muted)' }}>
            No se pudo cargar el barrio o el miembro.
          </p>
        </Card>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Preparación bautismal" onBack={() => navigate(-1)} variant="gradient">
        <Card variant="default" padding="md">
          <p style={{ textAlign: 'center', color: 'var(--am-color-text-muted)' }}>
            Cargando...
          </p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Preparación bautismal"
      onBack={() => navigate(-1)}
      variant="gradient"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {error && (
          <Card variant="default" padding="md" style={{ borderColor: 'var(--am-color-error, #dc2626)' }}>
            <p style={{ color: 'var(--am-color-error)', margin: 0 }}>{error}</p>
          </Card>
        )}

        {!data ? (
          <Card variant="default" padding="lg">
            <p style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--am-color-text-muted)' }}>
              Sin datos importados. El investigador puede exportar su preparación desde la app y compartirla contigo.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <Button
              variant="primary"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <FaFileImport style={{ marginRight: 8 }} />
              {importing ? 'Importando...' : 'Importar preparación (JSON)'}
            </Button>
          </Card>
        ) : (
          <>
            {stale && (
              <Card variant="default" padding="md" style={{ borderColor: 'var(--am-color-warning, #f59e0b)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaTriangleExclamation style={{ color: 'var(--am-color-warning)', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--am-color-text-main)' }}>
                    Los datos fueron exportados hace más de 7 días. Pide al investigador que comparta una versión actualizada.
                  </p>
                </div>
              </Card>
            )}

            <Card variant="default" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <SectionTitle style={{ margin: 0 }}>Resumen</SectionTitle>
                <Button variant="ghost" size="sm" onClick={copySummaryToClipboard}>
                  <FaCopy style={{ marginRight: 6 }} />
                  Copiar resumen
                </Button>
              </div>
              <p style={{ margin: '8px 0 8px 0', fontSize: 14 }}>
                <strong>Listo para bautizarse:</strong> {ready ? 'Sí' : 'No'}
              </p>
              {pending.length > 0 && (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--am-color-text-muted)' }}>
                  Pendiente: {pending.join(', ')}
                </p>
              )}
              <p style={{ margin: '12px 0 0 0', fontSize: 12, color: 'var(--am-color-text-muted)' }}>
                Última importación: {new Date(data.lastImportedAt).toLocaleDateString()}
              </p>
            </Card>

            {data.dataSummary?.baptismDate && (
              <Card variant="default" padding="md">
                <SectionTitle>Fecha y lugar</SectionTitle>
                <p style={{ margin: 0 }}>Fecha: {data.dataSummary.baptismDate}</p>
                {data.dataSummary.location && (
                  <p style={{ margin: '8px 0 0 0' }}>Lugar: {data.dataSummary.location}</p>
                )}
                {data.dataSummary.performedBy && (
                  <p style={{ margin: '8px 0 0 0' }}>Quién bautiza: {data.dataSummary.performedBy}</p>
                )}
              </Card>
            )}

            {data.dataSummary?.agendaProgram && (
              <Card variant="default" padding="md">
                <SectionTitle>Agenda</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.dataSummary.agendaProgram.speakerName && (
                    <p style={{ margin: 0 }}>Discursante: {data.dataSummary.agendaProgram.speakerName}</p>
                  )}
                  {data.dataSummary.agendaProgram.openingPrayerBy && (
                    <p style={{ margin: 0 }}>Oración apertura: {data.dataSummary.agendaProgram.openingPrayerBy}</p>
                  )}
                  {data.dataSummary.agendaProgram.closingPrayerBy && (
                    <p style={{ margin: 0 }}>Oración cierre: {data.dataSummary.agendaProgram.closingPrayerBy}</p>
                  )}
                  {[data.dataSummary.agendaProgram.hymn1, data.dataSummary.agendaProgram.hymn2, data.dataSummary.agendaProgram.hymn3]
                    .filter(Boolean)
                    .map((h, i) => (
                      <p key={i} style={{ margin: 0 }}>Himno {i + 1}: {h}</p>
                    ))}
                  {data.dataSummary.agendaProgram.confirmImmediately && (
                    <p style={{ margin: 0, fontSize: 13 }}>Confirmación inmediata: Sí</p>
                  )}
                </div>
              </Card>
            )}

            {(data.testimonyPreview || data.testimonyFull) && (
              <Card variant="default" padding="md">
                <SectionTitle>Compromiso personal</SectionTitle>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {data.testimonyFull ?? data.testimonyPreview}
                </p>
              </Card>
            )}

            <Card variant="default" padding="md">
              <SectionTitle>Tu feedback</SectionTitle>
              <textarea
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="Notas para el investigador..."
                rows={4}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 'var(--am-radius-sm, 10px)',
                  border: '1px solid var(--am-color-border)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ marginTop: 12 }}>
                <Button
                  variant="primary"
                  onClick={handleSaveFeedback}
                  disabled={savingFeedback}
                >
                {savingFeedback ? 'Guardando...' : 'Guardar feedback'}
                </Button>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <p style={{ fontSize: 13, color: 'var(--am-color-text-muted)', marginBottom: 8 }}>
                ¿Nueva versión? Reimporta el JSON para actualizar.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                <FaFileImport style={{ marginRight: 6 }} />
                Reimportar
              </Button>
            </Card>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default BaptismPreparationViewPage;
