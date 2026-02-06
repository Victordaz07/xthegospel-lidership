/**
 * Calling Detail - Agenda Tab
 *
 * Shows events linked to this calling.
 * Quick add for new events.
 */

import React, { useState, useMemo } from 'react';
import { useEventsStore } from '../../state';
import { EventKind, EVENT_KIND_LABELS, EVENT_KIND_ICONS } from '../../types';
import { EmptyState } from '../../../../ui/components';

interface Props {
  callingId: string;
}

const CallingDetailAgendaTab: React.FC<Props> = ({ callingId }) => {
  // Use direct selector instead of calling a method to avoid infinite loops
  const allEvents = useEventsStore(s => s.events);
  const events = useMemo(
    () => allEvents.filter(e => e.callingId === callingId),
    [allEvents, callingId],
  );
  const addEvent = useEventsStore(s => s.addEvent);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<EventKind>('followup');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && date) {
      addEvent({
        title: title.trim(),
        kind,
        date,
        time: time || undefined,
        location: location.trim() || undefined,
        callingId,
      });
      setTitle('');
      setDate('');
      setTime('');
      setLocation('');
      setShowForm(false);
    }
  };

  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const upcomingEvents = sortedEvents.filter(
    e => new Date(e.date) >= new Date(),
  );
  const pastEvents = sortedEvents.filter(e => new Date(e.date) < new Date());

  return (
    <div className="agenda-tab">
      <div className="tab-header">
        <h3>Agenda</h3>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '➕'}
        </button>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <form className="add-form" onSubmit={handleAddEvent}>
          <div className="form-group">
            <input
              type="text"
              value={title}
              onChange={e => setTitle((e.target as any).value)}
              placeholder="Título del evento"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select
                value={kind}
                onChange={e => setKind((e.target as any).value as EventKind)}
              >
                {Object.entries(EVENT_KIND_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {EVENT_KIND_ICONS[k as EventKind]} {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate((e.target as any).value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime((e.target as any).value)}
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="text"
              value={location}
              onChange={e => setLocation((e.target as any).value)}
              placeholder="Lugar (opcional)"
            />
          </div>
          <button type="submit" className="action-button primary">
            Añadir evento
          </button>
        </form>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="events-section">
          <h4>Próximos eventos</h4>
          <div className="events-list">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-icon">{EVENT_KIND_ICONS[event.kind]}</div>
                <div className="event-details">
                  <span className="event-title">{event.title}</span>
                  <span className="event-date">
                    📅 {new Date(event.date).toLocaleDateString()}
                    {event.time && ` • ${event.time}`}
                  </span>
                  {event.location && (
                    <span className="event-location">📍 {event.location}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="events-section past">
          <h4>Eventos pasados</h4>
          <div className="events-list">
            {pastEvents.map(event => (
              <div key={event.id} className="event-card past">
                <div className="event-icon">{EVENT_KIND_ICONS[event.kind]}</div>
                <div className="event-details">
                  <span className="event-title">{event.title}</span>
                  <span className="event-date">
                    📅 {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <EmptyState
          size="sm"
          title="No hay eventos programados"
          description="Puedes agregar uno en el formulario de arriba."
        />
      )}
    </div>
  );
};

export default CallingDetailAgendaTab;
