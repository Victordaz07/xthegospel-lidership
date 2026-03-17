/**
 * Leadership Callings Layout
 *
 * Layout with bottom nav specific for Leadership mode:
 * Dashboard, Callings, Calendar, Members
 *
 * Uses the shared BottomNav component which is mode-aware.
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LeadershipSyncBridge from '../features/leadershipCallings/components/LeadershipSyncBridge';
import {
  FaHouse,
  FaUser,
  FaUserCheck,
  FaChalkboardUser,
  FaCalendarDays,
  FaUsers,
} from 'react-icons/fa6';
import { BottomNav, type BottomNavItem } from '../ui/components';
import './LeadershipCallingsLayout.css';

const LEADERSHIP_NAV_ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Inicio', icon: <FaHouse /> },
  { id: 'callings', label: 'Llamados', icon: <FaUserCheck /> },
  { id: 'teaching', label: 'Enseñando', icon: <FaChalkboardUser /> },
  { id: 'calendar', label: 'Calendario', icon: <FaCalendarDays /> },
  { id: 'members', label: 'Miembros', icon: <FaUsers /> },
  { id: 'profile', label: 'Perfil', icon: <FaUser /> },
];

function pathnameToActiveId(pathname: string): string {
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/callings')) return 'callings';
  if (pathname.startsWith('/bishop/teaching')) return 'teaching';
  if (pathname.startsWith('/teaching')) return 'teaching';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/members')) return 'members';
  return 'home';
}

interface LeadershipCallingsLayoutProps {
  children: React.ReactNode;
}

export default function LeadershipCallingsLayout({
  children,
}: LeadershipCallingsLayoutProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const activeId = pathnameToActiveId(location.pathname);

  const handleSelect = (id: string) => {
    if (id === 'home') {
      navigate('/');
      return;
    }
    if (id === 'teaching') {
      navigate('/teaching');
      return;
    }
    navigate(`/${id}`);
  };

  return (
    <div className="leadership-callings-layout">
      <LeadershipSyncBridge />
      <main className="leadership-callings-content">{children}</main>

      <BottomNav
        items={LEADERSHIP_NAV_ITEMS}
        activeId={activeId}
        onSelect={handleSelect}
      />
    </div>
  );
}
