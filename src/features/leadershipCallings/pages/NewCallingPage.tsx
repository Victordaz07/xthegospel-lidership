/**
 * New Calling Page
 * 
 * Form to propose a new calling.
 * Simple, respectful, no pressure.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCallingsStore } from '../state';
import { OrganizationType, ORGANIZATION_LABELS } from '../types';
import { PageShell, Card, Button } from '../../../ui';
import './LeadershipPages.css';

// Mock members for development
const MOCK_MEMBERS = [
  { id: 'member-10', name: 'Carlos Rodríguez' },
  { id: 'member-11', name: 'Laura Fernández' },
  { id: 'member-12', name: 'Miguel Ángel Torres' },
  { id: 'member-13', name: 'Patricia Morales' },
  { id: 'member-14', name: 'Fernando Gutiérrez' },
];

const NewCallingPage: React.FC = () => {
  const navigate = useNavigate();
  const addCalling = useCallingsStore((s) => s.addCalling);
  
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [organization, setOrganization] = useState<OrganizationType | ''>('');
  const [position, setPosition] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleMemberChange = (e: any) => {
    const value = e.target.value;
    const selected = MOCK_MEMBERS.find(m => m.id === value);
    if (selected) {
      setMemberId(selected.id);
      setMemberName(selected.name);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberId || !organization || !position) {
      return;
    }
    
    const newCalling = addCalling({
      memberId,
      memberName,
      organization: organization as OrganizationType,
      position,
      proposedDate: proposedDate || undefined,
      notes: notes || undefined,
    });
    
    navigate(`/callings/${newCalling.id}`);
  };
  
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--am-radius-sm, 10px)',
    border: '1px solid var(--am-color-border, #e2e8f0)',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: 'white',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--am-color-text-main, #0f172a)',
    marginBottom: '8px',
  };

  return (
    <PageShell
      title="Nuevo Llamamiento"
      onBack={() => navigate(-1)}
      variant="gradient"
    >
      <Card variant="default" padding="lg">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="member" style={labelStyle}>👤 Miembro</label>
            <select 
              id="member"
              value={memberId}
              onChange={handleMemberChange}
              required
              style={inputStyle}
            >
              <option value="">Seleccionar miembro...</option>
              {MOCK_MEMBERS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="organization" style={labelStyle}>🏛️ Organización</label>
            <select
              id="organization"
              value={organization}
              onChange={(e) => setOrganization((e.target as any).value as OrganizationType)}
              required
              style={inputStyle}
            >
              <option value="">Seleccionar...</option>
              {Object.entries(ORGANIZATION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="position" style={labelStyle}>📋 Rol / Posición</label>
            <input
              id="position"
              type="text"
              value={position}
              onChange={(e) => setPosition((e.target as any).value)}
              placeholder="Ej: Presidente, Consejero, Maestro..."
              required
              style={inputStyle}
            />
          </div>
          
          <div>
            <label htmlFor="date" style={labelStyle}>📅 Fecha propuesta (opcional)</label>
            <input
              id="date"
              type="date"
              value={proposedDate}
              onChange={(e) => setProposedDate((e.target as any).value)}
              style={inputStyle}
            />
          </div>
          
          <div>
            <label htmlFor="notes" style={labelStyle}>📝 Notas (opcional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes((e.target as any).value)}
              placeholder="Notas adicionales..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <Button type="submit" variant="primary" fullWidth>
              Guardar como Propuesto
            </Button>
            <Button 
              type="button" 
              variant="ghost"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
};

export default NewCallingPage;
