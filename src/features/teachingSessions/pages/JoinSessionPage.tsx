/**
 * Join Session Page (Public Route)
 *
 * /join?code=XTG-5H8K2Q
 * Auth optional to view; auth required to join.
 * NO WardRequiredRoute.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  getSessionByJoinCode,
  joinSessionByCode,
} from '../services/participantsService';
import { isValidJoinCode, normalizeJoinCode, formatJoinCodeForDisplay } from '../utils/joinCode';
import { Card, Button } from '../../../ui';
import { APP_URLS } from '../../../utils/appBridge';
import './JoinSessionPage.css';

type JoinState =
  | { status: 'loading' }
  | { status: 'no_code' }
  | { status: 'invalid_code' }
  | { status: 'session_not_found' }
  | { status: 'session_not_active' }
  | { status: 'session_completed' }
  | { status: 'ready'; title: string }
  | { status: 'joining' }
  | { status: 'joined'; wardId: string; sessionId: string }
  | { status: 'error'; message: string };

const JoinSessionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<JoinState>({ status: 'loading' });

  const code = searchParams.get('code')?.trim() ?? '';

  useEffect(() => {
    if (!code) {
      setState({ status: 'no_code' });
      return;
    }

    if (!isValidJoinCode(code)) {
      setState({ status: 'invalid_code' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    getSessionByJoinCode(code)
      .then((lookup) => {
        if (cancelled) return;
        if (!lookup) {
          setState({ status: 'session_not_found' });
          return;
        }
        if (lookup.session.status === 'completed') {
          setState({ status: 'session_completed' });
          return;
        }
        if (lookup.session.status !== 'active') {
          setState({ status: 'session_not_active' });
          return;
        }
        setState({ status: 'ready', title: lookup.session.title });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'session_not_found' });
      });

    return () => { cancelled = true; };
  }, [code]);

  const handleLoginToJoin = () => {
    const returnTo = `/join?code=${encodeURIComponent(code)}`;
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const handleJoin = async () => {
    if (!user || !code) return;

    setState({ status: 'joining' });

    const result = await joinSessionByCode(code, {
      uid: user.uid,
      displayName: user.displayName ?? user.email ?? 'Participante',
      xtgId: (user as { xtgId?: string }).xtgId,
    });

    if (result.success) {
      setState({ status: 'joined', wardId: result.wardId, sessionId: result.sessionId });
      navigate(`/session/${result.wardId}/${result.sessionId}/live`, { replace: true });
    } else {
      setState({ status: 'error', message: result.error });
    }
  };

  const displayCode = code ? formatJoinCodeForDisplay(normalizeJoinCode(code)) : '';

  // Error states
  if (state.status === 'no_code') {
    return (
      <div className="join-session-page">
        <Card variant="default" padding="lg">
          <h2>Código requerido</h2>
          <p>Usa el enlace o escanea el QR que te compartió el maestro.</p>
          <p className="join-session-hint">Ejemplo: {APP_URLS.leader}/join?code=XTG-5H8K2Q</p>
        </Card>
      </div>
    );
  }

  if (state.status === 'invalid_code') {
    return (
      <div className="join-session-page">
        <Card variant="default" padding="lg">
          <h2>Código inválido</h2>
          <p>El formato debe ser XTG-XXXXXX (6 caracteres).</p>
        </Card>
      </div>
    );
  }

  if (state.status === 'session_not_found') {
    return (
      <div className="join-session-page">
        <Card variant="default" padding="lg">
          <h2>Sesión no disponible</h2>
          <p>No encontramos una sesión activa con este código.</p>
        </Card>
      </div>
    );
  }

  if (state.status === 'session_not_active' || state.status === 'session_completed') {
    return (
      <div className="join-session-page">
        <Card variant="default" padding="lg">
          <h2>Sesión no disponible</h2>
          <p>Esta sesión no está activa o ya finalizó. Pide al maestro un nuevo código.</p>
        </Card>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="join-session-page">
        <Card variant="default" padding="lg">
          <h2>Error</h2>
          <p>{state.message}</p>
          <div style={{ marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setState({ status: 'loading' })}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="join-session-page">
        <Card variant="default" padding="lg">
          <p>Cargando...</p>
        </Card>
      </div>
    );
  }

  // ready or joining
  const isReady = state.status === 'ready';

  return (
    <div className="join-session-page">
      <Card variant="default" padding="lg">
        <h2>Unirse a la sesión</h2>
        {isReady && <p className="join-session-title">{state.title}</p>}
        <p className="join-session-code">Código: {displayCode}</p>

        {!isAuthenticated ? (
          <div style={{ marginTop: 24 }}>
            <p>Inicia sesión para unirte a esta clase.</p>
            <Button variant="primary" fullWidth onClick={handleLoginToJoin}>
              Iniciar sesión para unirte
            </Button>
          </div>
        ) : (
          <div style={{ marginTop: 24 }}>
            <Button
              variant="primary"
              fullWidth
              onClick={handleJoin}
              disabled={state.status === 'joining'}
              loading={state.status === 'joining'}
            >
              {state.status === 'joining' ? 'Uniendo...' : 'Unirme a la sesión'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default JoinSessionPage;
