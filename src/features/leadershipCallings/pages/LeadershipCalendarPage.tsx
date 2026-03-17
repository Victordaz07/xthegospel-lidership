/**
 * Leadership Calendar Page
 * 
 * Monthly/Weekly view of leadership events.
 * Includes conflict detection (calm, not urgent).
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEventsStore } from '../state';
import { EventKind, EVENT_KIND_LABELS, EVENT_KIND_ICONS, ORGANIZATION_LABELS, OrganizationType, CallingEvent, CallingEventFormData } from '../types';

type ViewMode = 'month' | 'week';

const LeadershipCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const events = useEventsStore((s) => s.events);
  const addEvent = useEventsStore((s) => s.addEvent);
  const hasConflict = useEventsStore((s) => s.hasConflict);
  
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterKind, setFilterKind] = useState<string>('all');
  
  // Event form state
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formKind, setFormKind] = useState<EventKind>('meeting');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  
  // Conflict modal state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictEvents, setConflictEvents] = useState<CallingEvent[]>([]);
  const [pendingEvent, setPendingEvent] = useState<CallingEventFormData | null>(null);
  
  // Handle deep link to specific event
  const eventIdParam = searchParams.get('eventId');
  
  // Get days in current month
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    // Add padding for first week
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentDate]);
  
  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterOrg !== 'all' && e.organization !== filterOrg) return false;
      if (filterKind !== 'all' && e.kind !== filterKind) return false;
      return true;
    });
  }, [events, filterOrg, filterKind]);
  
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(e => e.date === dateStr);
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formTitle.trim() || !formDate) return;
    
    // Check for conflicts
    const conflicts = hasConflict(formDate, formTime || undefined);
    
    if (conflicts.length > 0 && formTime) {
      setConflictEvents(conflicts);
      setPendingEvent({
        title: formTitle.trim(),
        kind: formKind,
        date: formDate,
        time: formTime || undefined,
        location: formLocation.trim() || undefined,
      });
      setShowConflictModal(true);
      return;
    }
    
    addEvent({
      title: formTitle.trim(),
      kind: formKind,
      date: formDate,
      time: formTime || undefined,
      location: formLocation.trim() || undefined,
    });
    
    resetForm();
  };
  
  const handleKeepAnyway = () => {
    if (pendingEvent) {
      addEvent(pendingEvent);
    }
    setShowConflictModal(false);
    setPendingEvent(null);
    resetForm();
  };
  
  const handleChangeTime = () => {
    setShowConflictModal(false);
    // Keep form open for user to change time
  };
  
  const resetForm = () => {
    setFormTitle('');
    setFormKind('meeting');
    setFormDate('');
    setFormTime('');
    setFormLocation('');
    setShowForm(false);
  };
  
  const monthName = currentDate.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  
  return (
    <div className="leadership-page">
      <header className="leadership-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Volver
        </button>
        <h1>Calendario</h1>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '➕'}
        </button>
      </header>
      
      <main className="leadership-content">
        {/* View Toggle */}
        <div className="view-toggle">
          <button 
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            Mes
          </button>
          <button 
            className={viewMode === 'week' ? 'active' : ''}
            onClick={() => setViewMode('week')}
          >
            Semana
          </button>
        </div>
        
        {/* Filters */}
        <div className="calendar-filters">
          <select value={filterOrg} onChange={(e) => setFilterOrg((e.target as any).value)}>
            <option value="all">Todas las organizaciones</option>
            {Object.entries(ORGANIZATION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select value={filterKind} onChange={(e) => setFilterKind((e.target as any).value)}>
            <option value="all">Todos los tipos</option>
            {Object.entries(EVENT_KIND_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        
        {/* Add Event Form */}
        {showForm && (
          <form className="add-form calendar-form" onSubmit={handleAddEvent}>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle((e.target as any).value)}
              placeholder="Título del evento"
              required
            />
            <div className="form-row">
              <select value={formKind} onChange={(e) => setFormKind((e.target as any).value as EventKind)}>
                {Object.entries(EVENT_KIND_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate((e.target as any).value)}
                required
              />
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime((e.target as any).value)}
              />
            </div>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation((e.target as any).value)}
              placeholder="Lugar (opcional)"
            />
            <button type="submit" className="action-button primary">
              Añadir evento
            </button>
          </form>
        )}
        
        {/* Month View */}
        {viewMode === 'month' && (
          <div className="calendar-month">
            <div className="month-header">
              <button onClick={handlePrevMonth}>◀</button>
              <span className="month-name">{monthName}</span>
              <button onClick={handleNextMonth}>▶</button>
            </div>
            
            <div className="calendar-grid">
              <div className="weekday-header">D</div>
              <div className="weekday-header">L</div>
              <div className="weekday-header">M</div>
              <div className="weekday-header">M</div>
              <div className="weekday-header">J</div>
              <div className="weekday-header">V</div>
              <div className="weekday-header">S</div>
              
              {daysInMonth.map((day, idx) => {
                const dayEvents = getEventsForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                
                return (
                  <div 
                    key={idx} 
                    className={`calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                  >
                    <span className="day-number">{day.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="day-events">
                        {dayEvents.slice(0, 2).map(evt => (
                          <span key={evt.id} className="event-dot" title={evt.title}>
                            {EVENT_KIND_ICONS[evt.kind]}
                          </span>
                        ))}
                        {dayEvents.length > 2 && <span className="more">+{dayEvents.length - 2}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Events List */}
        <div className="events-list-section">
          <h3>Próximos eventos</h3>
          {filteredEvents
            .filter(e => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 10)
            .map(event => (
              <div key={event.id} className="event-card">
                <div className="event-icon">{EVENT_KIND_ICONS[event.kind]}</div>
                <div className="event-details">
                  <span className="event-title">{event.title}</span>
                  <span className="event-date">
                    📅 {new Date(event.date).toLocaleDateString()}
                    {event.time && ` • ${event.time}`}
                  </span>
                  {event.location && <span className="event-location">📍 {event.location}</span>}
                </div>
              </div>
            ))}
        </div>
      </main>
      
      {/* Conflict Modal */}
      {showConflictModal && (
        <div className="modal-overlay">
          <div className="modal conflict-modal">
            <h3>📅 Ya hay un evento a esa hora</h3>
            <p>
              Tienes {conflictEvents.length} evento(s) programado(s) para el mismo horario:
            </p>
            <ul className="conflict-list">
              {conflictEvents.map(evt => (
                <li key={evt.id}>
                  {EVENT_KIND_ICONS[evt.kind]} {evt.title} • {evt.time}
                </li>
              ))}
            </ul>
            <p className="modal-note">
              No es un error — solo queremos asegurarnos de que lo sepas.
            </p>
            <div className="modal-actions">
              <button className="action-button primary" onClick={handleKeepAnyway}>
                Guardar de todos modos
              </button>
              <button className="action-button secondary" onClick={handleChangeTime}>
                Cambiar hora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadershipCalendarPage;
