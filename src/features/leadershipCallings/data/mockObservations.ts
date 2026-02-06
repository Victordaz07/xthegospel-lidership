/**
 * Mock Observations Data for Development
 * 
 * Observations are descriptive progress notes - NO metrics.
 */

import { Observation } from '../types';

export const mockObservations: Observation[] = [
  {
    id: 'obs-1',
    callingId: 'calling-1',
    content: 'María se ha adaptado muy bien a su llamamiento. Las hermanas la apoyan y ella ha demostrado liderazgo natural.',
    milestone: 'Trabajando de forma independiente',
    createdAt: '2024-06-15T10:00:00Z',
  },
  {
    id: 'obs-2',
    callingId: 'calling-1',
    content: 'La actividad de Navidad fue un éxito. Buena coordinación con sus consejeras.',
    createdAt: '2024-12-20T14:00:00Z',
  },
  {
    id: 'obs-3',
    callingId: 'calling-2',
    content: 'Juan está preparándose bien para su primera lección. Ha estudiado el manual y tiene preguntas reflexivas.',
    milestone: 'Comenzó capacitación',
    createdAt: '2026-01-21T10:00:00Z',
  },
  {
    id: 'obs-4',
    callingId: 'calling-5',
    content: 'Roberto mantiene buenos registros y está al día con sus responsabilidades.',
    createdAt: '2025-11-10T10:00:00Z',
  },
];
