/**
 * Mock Leadership Notes Data for Development
 */

import { LeadershipNote } from '../types';

export const mockLeadershipNotes: LeadershipNote[] = [
  {
    id: 'note-1',
    scope: 'calling',
    scopeId: 'calling-1',
    type: 'followup',
    content: 'Hablé con María sobre su llamamiento. Se siente bien apoyada por sus consejeras. Mencionó que la actividad mensual está tomando forma.',
    isDictated: false,
    createdAt: '2026-01-24T14:30:00Z',
    updatedAt: '2026-01-24T14:30:00Z',
  },
  {
    id: 'note-2',
    scope: 'calling',
    scopeId: 'calling-1',
    type: 'administrative',
    content: 'Coordinamos el presupuesto para las actividades del trimestre. Todo en orden.',
    isDictated: false,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'note-3',
    scope: 'member',
    scopeId: 'member-2',
    type: 'followup',
    content: 'Juan expresó interés en servir más en la enseñanza. Muy comprometido con su nuevo llamamiento.',
    isDictated: true,
    createdAt: '2026-01-20T16:00:00Z',
    updatedAt: '2026-01-20T16:00:00Z',
  },
  {
    id: 'note-4',
    scope: 'calling',
    scopeId: 'calling-2',
    type: 'pastoral',
    content: 'Juan mencionó que su familia está pasando por un momento difícil. Ofrecer apoyo.',
    isDictated: false,
    createdAt: '2026-01-22T09:00:00Z',
    updatedAt: '2026-01-22T09:00:00Z',
  },
  {
    id: 'note-5',
    scope: 'member',
    scopeId: 'member-3',
    type: 'followup',
    content: 'Ana está entusiasmada con la posibilidad de servir en Mujeres Jóvenes.',
    isDictated: false,
    createdAt: '2026-01-22T17:00:00Z',
    updatedAt: '2026-01-22T17:00:00Z',
  },
];
