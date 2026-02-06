/**
 * Leadership Members Page
 * 
 * Shows members with their callings.
 * Simple list, no surveillance metrics.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCallingsStore } from '../state';
import { PageShell, Card } from '../../../ui';

// Mock members for development
const MOCK_MEMBERS = [
  { id: 'member-1', name: 'María García', since: '2018' },
  { id: 'member-2', name: 'Juan Pérez', since: '2020' },
  { id: 'member-3', name: 'Ana López', since: '2019' },
  { id: 'member-4', name: 'Pedro Martínez', since: '2016' },
  { id: 'member-5', name: 'Roberto Sánchez', since: '2021' },
  { id: 'member-10', name: 'Carlos Rodríguez', since: '2022' },
  { id: 'member-11', name: 'Laura Fernández', since: '2023' },
];

const LeadershipMembersPage: React.FC = () => {
  const navigate = useNavigate();
  const callings = useCallingsStore((s) => s.callings);
  
  const getMemberCallings = (memberId: string) => {
    return callings.filter(c => c.memberId === memberId && c.status !== 'released');
  };
  
  return (
    <PageShell
      title="Miembros"
      onBack={() => navigate('/home')}
      variant="gradient"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {MOCK_MEMBERS.map(member => {
          const memberCallings = getMemberCallings(member.id);
          
          return (
            <Card
              key={member.id}
              variant="default"
              padding="md"
              onClick={() => navigate(`/members/${member.id}`)}
              className="member-card-clickable"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--am-color-text-main, #0f172a)', marginBottom: '4px' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--am-color-text-muted, #64748b)', marginBottom: '8px' }}>
                    Miembro desde {member.since}
                  </div>
                  {memberCallings.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {memberCallings.map(c => (
                        <span 
                          key={c.id} 
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '999px',
                            background: 'var(--am-color-primary-soft, #eef2ff)',
                            color: 'var(--am-color-primary-strong, #4f46e5)',
                          }}
                        >
                          {c.position}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '18px', color: 'var(--am-color-text-muted, #64748b)' }}>→</span>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
};

export default LeadershipMembersPage;
