import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './FloatingMenu.css';

export interface FloatingMenuTab {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface FloatingMenuProps {
  tabs: FloatingMenuTab[];
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ tabs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="floating-menu" ref={menuRef}>
      <button
        className="floating-menu-button"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {isOpen && (
        <div className="floating-menu-dropdown">
          {tabs.map(tab => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`floating-menu-item ${isActive(tab.path) ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
              title={tab.label}
              aria-label={tab.label}
            >
              <span className="floating-menu-item-icon">{tab.icon}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
