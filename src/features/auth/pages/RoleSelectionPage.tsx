/**
 * Role Selection Page
 * 
 * Allows the user to select their leadership calling/role.
 * This determines their permissions and what they can see in the app.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRoleStore } from '../../../state/user/useUserRoleStore';
import { getRolesGrouped, LeadershipRole, RoleDefinition } from '../../../config/roles';
import './RoleSelectionPage.css';

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { role: currentRole, setRole } = useUserRoleStore();
  const [selectedRole, setSelectedRole] = useState<LeadershipRole | null>(currentRole);
  
  const roleGroups = getRolesGrouped();

  const handleRoleSelect = (role: LeadershipRole) => {
    setSelectedRole(role);
  };

  const handleConfirm = () => {
    if (selectedRole) {
      setRole(selectedRole);
      navigate('/', { replace: true });
    }
  };

  const handleSkip = () => {
    // Set a default role if skipping
    setRole('other_leader');
    navigate('/', { replace: true });
  };

  return (
    <div className="role-selection-page">
      <div className="role-selection-container">
        {/* Header */}
        <div className="role-selection-header">
          <div className="role-selection-icon">👔</div>
          <h1 className="role-selection-title">¿Cuál es tu llamamiento?</h1>
          <p className="role-selection-subtitle">
            Selecciona tu rol para personalizar tu experiencia
          </p>
        </div>

        {/* Role Groups */}
        <div className="role-groups">
          {roleGroups.map((group) => (
            <div key={group.label} className="role-group">
              <h2 className="role-group-title">{group.label}</h2>
              <div className="role-list">
                {group.roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    isSelected={selectedRole === role.id}
                    onClick={() => handleRoleSelect(role.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="role-selection-actions">
          <button
            className="role-confirm-button"
            onClick={handleConfirm}
            disabled={!selectedRole}
          >
            Confirmar
          </button>
          <button
            className="role-skip-button"
            onClick={handleSkip}
          >
            Omitir por ahora
          </button>
        </div>
      </div>
    </div>
  );
};

// Role Card Component
interface RoleCardProps {
  role: RoleDefinition;
  isSelected: boolean;
  onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, isSelected, onClick }) => {
  return (
    <button
      className={`role-card ${isSelected ? 'role-card-selected' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className="role-card-icon">{role.icon}</span>
      <span className="role-card-label">{role.label}</span>
    </button>
  );
};

export default RoleSelectionPage;
