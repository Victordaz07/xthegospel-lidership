/**
 * Mock Callings Data for Development
 */

import { Calling } from '../types';

export const mockCallings: Calling[] = [
  {
    id: 'calling-1',
    memberId: 'member-1',
    memberName: 'María García',
    organization: 'relief_society',
    position: 'Presidenta',
    status: 'active',
    timeline: {
      proposedAt: '2024-02-15',
      calledAt: '2024-02-20',
      sustainedAt: '2024-03-03',
      setApartAt: '2024-03-10',
    },
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-03-10T14:00:00Z',
  },
  {
    id: 'calling-2',
    memberId: 'member-2',
    memberName: 'Juan Pérez',
    organization: 'sunday_school',
    position: 'Maestro',
    status: 'set_apart',
    timeline: {
      proposedAt: '2026-01-10',
      calledAt: '2026-01-12',
      sustainedAt: '2026-01-19',
      setApartAt: '2026-01-20',
    },
    notes: 'Tiene experiencia enseñando. Muy comprometido.',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'calling-3',
    memberId: 'member-3',
    memberName: 'Ana López',
    organization: 'young_women',
    position: 'Consejera',
    status: 'proposed',
    timeline: {
      proposedAt: '2026-01-22',
    },
    notes: 'Recomendada por la presidenta actual.',
    createdAt: '2026-01-22T16:00:00Z',
    updatedAt: '2026-01-22T16:00:00Z',
  },
  {
    id: 'calling-4',
    memberId: 'member-4',
    memberName: 'Pedro Martínez',
    organization: 'ward_mission',
    position: 'Líder de Misión del Barrio',
    status: 'released',
    timeline: {
      proposedAt: '2023-06-01',
      calledAt: '2023-06-05',
      sustainedAt: '2023-06-11',
      setApartAt: '2023-06-11',
      releasedAt: '2025-12-15',
    },
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'calling-5',
    memberId: 'member-5',
    memberName: 'Roberto Sánchez',
    organization: 'elders_quorum',
    position: 'Secretario',
    status: 'active',
    timeline: {
      proposedAt: '2025-08-01',
      calledAt: '2025-08-05',
      sustainedAt: '2025-08-10',
      setApartAt: '2025-08-10',
    },
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-10T14:00:00Z',
  },
];
