/**
 * Mock Responsibilities Data for Development
 */

import { Responsibility } from '../types';

export const mockResponsibilities: Responsibility[] = [
  {
    id: 'resp-1',
    callingId: 'calling-1',
    title: 'Organizar actividad mensual',
    description: 'Coordinar la actividad de febrero para las hermanas del barrio.',
    status: 'pending',
    priority: 'medium',
    suggestedDate: '2026-02-15',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'resp-2',
    callingId: 'calling-1',
    title: 'Visitar hermanas nuevas',
    description: 'Dar la bienvenida a las 3 hermanas que se mudaron al barrio.',
    status: 'in_progress',
    priority: 'medium',
    notes: 'Visitó a 2 de 3 hermanas.',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-23T14:00:00Z',
  },
  {
    id: 'resp-3',
    callingId: 'calling-1',
    title: 'Reunión con obispado',
    description: 'Coordinar necesidades de bienestar del barrio.',
    status: 'done',
    priority: 'medium',
    completedAt: '2026-01-20T18:00:00Z',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-20T18:00:00Z',
  },
  {
    id: 'resp-4',
    callingId: 'calling-2',
    title: 'Preparar primera lección',
    description: 'Estudiar el manual y preparar materiales para la clase de Doctrina del Evangelio.',
    status: 'pending',
    priority: 'medium',
    suggestedDate: '2026-02-02',
    createdAt: '2026-01-21T09:00:00Z',
    updatedAt: '2026-01-21T09:00:00Z',
  },
  {
    id: 'resp-5',
    callingId: 'calling-5',
    title: 'Actualizar lista de asistencia',
    description: 'Mantener actualizado el registro de los hermanos del cuórum.',
    status: 'in_progress',
    priority: 'low',
    createdAt: '2025-08-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
];
