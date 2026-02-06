/**
 * Calling Detail Page with 5 Tabs
 * 
 * Core page for managing a single calling.
 * Tabs: Summary, Responsibilities, Notes, Agenda, Progress
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCallingsStore } from '../state';
import { STATUS_LABELS, ORGANIZATION_LABELS } from '../types';
import CallingDetailSummaryTab from './tabs/CallingDetailSummaryTab';
import CallingDetailResponsibilitiesTab from './tabs/CallingDetailResponsibilitiesTab';
import CallingDetailNotesTab from './tabs/CallingDetailNotesTab';
import CallingDetailAgendaTab from './tabs/CallingDetailAgendaTab';
import CallingDetailProgressTab from './tabs/CallingDetailProgressTab';
import './LeadershipPages.css';

type TabId = 'summary' | 'responsibilities' | 'notes' | 'agenda' | 'progress';

const TABS: { id: TabId; label: string }[] = [
  { id: 'summary', label: 'Resumen' },
  { id: 'responsibilities', label: 'Resp.' },
  { id: 'notes', label: 'Notas' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'progress', label: 'Progreso' },
];

const CallingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getCalling = useCallingsStore((s) => s.getCallingById);
  
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  
  const calling = id ? getCalling(id) : undefined;
  
  if (!calling) {
    return (
      <div className="leadership-page">
        <header className="leadership-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <h1>Llamamiento no encontrado</h1>
        </header>
        <main className="leadership-content">
          <p>El llamamiento solicitado no existe.</p>
        </main>
      </div>
    );
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <CallingDetailSummaryTab calling={calling} />;
      case 'responsibilities':
        return <CallingDetailResponsibilitiesTab callingId={calling.id} />;
      case 'notes':
        return <CallingDetailNotesTab callingId={calling.id} />;
      case 'agenda':
        return <CallingDetailAgendaTab callingId={calling.id} />;
      case 'progress':
        return <CallingDetailProgressTab callingId={calling.id} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="leadership-page">
      <header className="leadership-header">
        <button className="back-button" onClick={() => navigate('/callings')}>
          ← Volver
        </button>
        <h1>Llamamiento</h1>
      </header>
      
      <main className="leadership-content">
        {/* Calling Header */}
        <div className="calling-detail-header">
          <div className="calling-avatar">👤</div>
          <h2 className="calling-member-name">{calling.memberName}</h2>
          <p className="calling-position">{calling.position}</p>
          <p className="calling-org">{ORGANIZATION_LABELS[calling.organization]}</p>
          <span className={`status-badge status-${calling.status}`}>
            {STATUS_LABELS[calling.status]}
          </span>
        </div>
        
        {/* Tabs */}
        <div className="detail-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`detail-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default CallingDetailPage;
