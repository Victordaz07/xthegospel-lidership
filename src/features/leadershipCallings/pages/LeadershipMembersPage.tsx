/**
 * Leadership Members Page
 * 
 * Shows members with their callings and allows searching for new members
 * using their xTheGospel ID.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaMagnifyingGlass, FaQrcode, FaUserPlus, FaDatabase, FaSpinner, FaRotate, FaChurch } from 'react-icons/fa6';
import { useCallingsStore } from '../state';
import { PageShell, Card } from '../../../ui';
import { MemberLookup, QRScanner } from '../../../components/profile';
import { WardCodeGenerator } from '../../../components/ward';
import { UniversalUserProfile, MemberStatus } from '../../../types/user';
import { useRegisteredMembers } from '../../../hooks/useUserProfile';
import { seedTestProfiles, getTestIds } from '../../../utils/seedTestData';
import './LeadershipMembersPage.css';

// Member status labels - "investigator" shows as "Amigo" per church terminology
const STATUS_LABELS: Record<MemberStatus, string> = {
  investigator: 'Amigo',
  new_convert: 'Nuevo Converso',
  active: 'Miembro',
  less_active: 'Miembro',
  returned: 'Retornado',
};

type TabType = 'members' | 'lookup' | 'scanner';

const LeadershipMembersPage: React.FC = () => {
  const navigate = useNavigate();
  const callings = useCallingsStore((s) => s.callings);
  const { members, loading: membersLoading, refetch: refetchMembers } = useRegisteredMembers(50);
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const result = await seedTestProfiles();
      setSeedResult(`✅ ${result.success} perfiles creados. IDs de prueba: ${getTestIds().join(', ')}`);
      // Refetch members to show the new ones
      setTimeout(() => refetchMembers(), 500);
    } catch (error: any) {
      setSeedResult(`❌ Error: ${error.message}`);
    } finally {
      setSeeding(false);
    }
  };
  
  const getMemberCallings = (memberId: string) => {
    return callings.filter(c => c.memberId === memberId && c.status !== 'released');
  };

  // Format date to year string
  const formatYear = (timestamp: any): string => {
    if (!timestamp) return '2024';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.getFullYear().toString();
    } catch {
      return '2024';
    }
  };

  const handleMemberFound = (profile: UniversalUserProfile) => {
    console.log('Miembro encontrado:', profile);
    // Could add the member to the ward here
  };

  const handleVerify = (profile: UniversalUserProfile) => {
    console.log('Miembro verificado:', profile);
    // Profile is now verified
  };

  const handleScan = (xthegospelId: string, displayName?: string) => {
    console.log('Escaneado:', xthegospelId, displayName);
    setScannedId(xthegospelId);
    setActiveTab('lookup');
  };
  
  return (
    <PageShell
      title="Miembros"
      onBack={() => navigate('/home')}
      variant="gradient"
    >
      {/* Tab Navigation */}
      <div className="lm-tabs">
        <button 
          className={`lm-tab ${activeTab === 'members' ? 'lm-tab--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <FaUsers />
          <span>Miembros</span>
        </button>
        <button 
          className={`lm-tab ${activeTab === 'lookup' ? 'lm-tab--active' : ''}`}
          onClick={() => setActiveTab('lookup')}
        >
          <FaMagnifyingGlass />
          <span>Buscar</span>
        </button>
        <button 
          className={`lm-tab ${activeTab === 'scanner' ? 'lm-tab--active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <FaQrcode />
          <span>Escanear</span>
        </button>
      </div>

      {/* Members List Tab */}
      {activeTab === 'members' && (
        <div className="lm-content">
          <div className="lm-section-header">
            <h2 className="lm-section-title">Miembros Registrados</h2>
            <div className="lm-section-header-actions">
              <span className="lm-section-count">{members.length} miembros</span>
              <button 
                className="lm-refresh-btn"
                onClick={refetchMembers}
                disabled={membersLoading}
              >
                <FaRotate className={membersLoading ? 'lm-spinning' : ''} />
              </button>
            </div>
          </div>
          
          {membersLoading ? (
            <div className="lm-loading">
              <FaSpinner className="lm-spinner" />
              <span>Cargando miembros...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="lm-empty">
              <FaUsers className="lm-empty-icon" />
              <p>No hay miembros registrados</p>
              <button 
                className="lm-seed-btn"
                onClick={handleSeedData}
                disabled={seeding}
              >
                <FaDatabase />
                {seeding ? 'Creando datos...' : 'Crear Datos de Prueba'}
              </button>
            </div>
          ) : (
            <div className="lm-members-list">
              {members.map(member => {
                const memberCallings = getMemberCallings(member.uid);
                
                return (
                  <Card
                    key={member.uid}
                    variant="default"
                    padding="md"
                    onClick={() => navigate(`/members/${member.uid}`)}
                    className="lm-member-card"
                  >
                    <div className="lm-member-row">
                      <div className="lm-member-avatar">
                        {member.photoURL ? (
                          <img src={member.photoURL} alt={member.displayName} />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div className="lm-member-info">
                        <div className="lm-member-name">{member.displayName}</div>
                        <div className="lm-member-id">{member.xthegospelId}</div>
                        <div className="lm-member-meta">
                          <span className={`lm-member-status lm-status--${member.memberStatus}`}>
                            {STATUS_LABELS[member.memberStatus]}
                          </span>
                          <span className="lm-member-since">
                            desde {formatYear(member.createdAt)}
                          </span>
                        </div>
                        {memberCallings.length > 0 && (
                          <div className="lm-member-callings">
                            {memberCallings.map(c => (
                              <span key={c.id} className="lm-calling-badge">
                                {c.position}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="lm-member-arrow">→</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Add Member Button */}
          <button 
            className="lm-add-member-btn"
            onClick={() => setActiveTab('lookup')}
          >
            <FaUserPlus />
            Agregar Miembro por ID
          </button>
        </div>
      )}

      {/* Lookup Tab */}
      {activeTab === 'lookup' && (
        <div className="lm-content">
          {/* Dev: Seed Test Data */}
          <div className="lm-dev-tools">
            <button 
              className="lm-seed-btn"
              onClick={handleSeedData}
              disabled={seeding}
            >
              <FaDatabase />
              {seeding ? 'Creando datos...' : 'Crear Datos de Prueba'}
            </button>
            {seedResult && (
              <div className={`lm-seed-result ${seedResult.startsWith('✅') ? 'lm-seed-result--success' : 'lm-seed-result--error'}`}>
                {seedResult}
              </div>
            )}
            <p className="lm-dev-hint">
              IDs disponibles: <code>XTG-2026-TEST01</code> a <code>XTG-2026-TEST05</code>
            </p>
          </div>

          <MemberLookup 
            onMemberFound={handleMemberFound}
            onVerify={handleVerify}
            initialId={scannedId}
          />
        </div>
      )}

      {/* Scanner Tab */}
      {activeTab === 'scanner' && (
        <div className="lm-content">
          <QRScanner 
            onScan={handleScan}
          />
        </div>
      )}
    </PageShell>
  );
};

export default LeadershipMembersPage;
