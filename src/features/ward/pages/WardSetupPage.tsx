/**
 * Ward Setup Page
 * 
 * Page for setting up ward membership:
 * - Bishopric: Create new ward
 * - Other leaders: Join existing ward with code
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useUserRoleStore } from '../../../state/user/useUserRoleStore';
import { useWardStore } from '../../../state/ward/useWardStore';
import { CreateWardRequest } from '../../../types/ward';
import './WardSetupPage.css';

type SetupMode = 'choose' | 'create' | 'join';

const WardSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBishopric, getRoleLabel } = useUserRoleStore();
  const { createNewWard, joinWard, isLoading, error, clearError } = useWardStore();
  
  const [mode, setMode] = useState<SetupMode>('choose');
  
  // Create form state
  const [wardName, setWardName] = useState('');
  const [wardType, setWardType] = useState<'ward' | 'branch'>('ward');
  const [stakeName, setStakeName] = useState('');
  const [stakeType, setStakeType] = useState<'stake' | 'district'>('stake');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  
  // Join form state
  const [joinCode, setJoinCode] = useState('');

  const canCreate = isBishopric();

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !wardName.trim()) return;

    const request: CreateWardRequest = {
      name: wardName.trim(),
      type: wardType,
      stakeName: stakeName.trim() || undefined,
      stakeType: stakeType,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
    };

    try {
      await createNewWard(request, user.uid);
      navigate('/', { replace: true });
    } catch (err) {
      // Error handled in store
    }
  };

  const handleJoinWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode.trim()) return;

    const result = await joinWard(joinCode.trim(), user.uid);
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  // Format code input
  const handleCodeChange = (value: string) => {
    // Allow only alphanumeric and format as XXX-XXX
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (clean.length <= 6) {
      if (clean.length > 3) {
        setJoinCode(`${clean.slice(0, 3)}-${clean.slice(3)}`);
      } else {
        setJoinCode(clean);
      }
    }
  };

  // Choose mode screen
  if (mode === 'choose') {
    return (
      <div className="ward-setup-page">
        <div className="ward-setup-container">
          <div className="ward-setup-header">
            <div className="ward-setup-icon">🏛️</div>
            <h1 className="ward-setup-title">Conectar con tu Barrio</h1>
            <p className="ward-setup-subtitle">
              Como <strong>{getRoleLabel()}</strong>, necesitas conectarte a un barrio para comenzar
            </p>
          </div>

          <div className="ward-setup-options">
            {canCreate && (
              <button
                className="ward-option-card ward-option-create"
                onClick={() => setMode('create')}
              >
                <span className="option-icon">➕</span>
                <span className="option-title">Crear Barrio</span>
                <span className="option-desc">
                  Soy el primero de mi barrio en usar la app
                </span>
              </button>
            )}

            <button
              className="ward-option-card ward-option-join"
              onClick={() => setMode('join')}
            >
              <span className="option-icon">🔗</span>
              <span className="option-title">Tengo un código</span>
              <span className="option-desc">
                Mi obispado me dio un código de barrio
              </span>
            </button>
          </div>

          {!canCreate && (
            <div className="ward-setup-note">
              <p>
                💡 Pide el código de tu barrio al obispado o al secretario ejecutivo
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create ward form
  if (mode === 'create') {
    return (
      <div className="ward-setup-page">
        <div className="ward-setup-container">
          <button className="ward-back-button" onClick={() => { setMode('choose'); clearError(); }}>
            ← Volver
          </button>

          <div className="ward-setup-header">
            <div className="ward-setup-icon">➕</div>
            <h1 className="ward-setup-title">Crear tu Barrio</h1>
            <p className="ward-setup-subtitle">
              Se generará un código único para que otros líderes se unan
            </p>
          </div>

          <form className="ward-form" onSubmit={handleCreateWard}>
            {/* Ward Name */}
            <div className="form-group">
              <label htmlFor="wardName">Nombre del Barrio / Rama *</label>
              <input
                id="wardName"
                type="text"
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                placeholder="Ej: Barrio Centro, Rama Norte"
                required
              />
            </div>

            {/* Ward Type */}
            <div className="form-group">
              <label>Tipo de Unidad</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="wardType"
                    value="ward"
                    checked={wardType === 'ward'}
                    onChange={() => setWardType('ward')}
                  />
                  <span>Barrio</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="wardType"
                    value="branch"
                    checked={wardType === 'branch'}
                    onChange={() => setWardType('branch')}
                  />
                  <span>Rama</span>
                </label>
              </div>
            </div>

            {/* Stake Name */}
            <div className="form-group">
              <label htmlFor="stakeName">Nombre de la Estaca / Distrito</label>
              <input
                id="stakeName"
                type="text"
                value={stakeName}
                onChange={(e) => setStakeName(e.target.value)}
                placeholder="Ej: Estaca Lima Centro"
              />
            </div>

            {/* Stake Type */}
            <div className="form-group">
              <label>Tipo</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="stakeType"
                    value="stake"
                    checked={stakeType === 'stake'}
                    onChange={() => setStakeType('stake')}
                  />
                  <span>Estaca</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="stakeType"
                    value="district"
                    checked={stakeType === 'district'}
                    onChange={() => setStakeType('district')}
                  />
                  <span>Distrito</span>
                </label>
              </div>
            </div>

            {/* Location */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ciudad</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ciudad"
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">País</label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="País"
                />
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button
              type="submit"
              className="ward-submit-button"
              disabled={isLoading || !wardName.trim()}
            >
              {isLoading ? '⏳ Creando...' : '✓ Crear Barrio'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Join ward form
  return (
    <div className="ward-setup-page">
      <div className="ward-setup-container">
        <button className="ward-back-button" onClick={() => { setMode('choose'); clearError(); }}>
          ← Volver
        </button>

        <div className="ward-setup-header">
          <div className="ward-setup-icon">🔗</div>
          <h1 className="ward-setup-title">Unirse a un Barrio</h1>
          <p className="ward-setup-subtitle">
            Ingresa el código de 6 caracteres que te dio tu obispado
          </p>
        </div>

        <form className="ward-form" onSubmit={handleJoinWard}>
          <div className="form-group">
            <label htmlFor="joinCode">Código del Barrio</label>
            <input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="XXX-XXX"
              className="code-input"
              maxLength={7}
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className="ward-submit-button"
            disabled={isLoading || joinCode.replace('-', '').length !== 6}
          >
            {isLoading ? '⏳ Verificando...' : '✓ Unirse al Barrio'}
          </button>
        </form>

        <div className="ward-setup-help">
          <p>¿No tienes código?</p>
          <p className="help-text">
            Pide el código a tu obispo, consejero o secretario ejecutivo.
            Ellos pueden encontrarlo en su perfil dentro de la app.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WardSetupPage;
