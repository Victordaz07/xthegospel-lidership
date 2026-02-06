/**
 * useUserProfile Hook
 * 
 * Provides easy access to the current user's universal profile.
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '../state/auth/useAuthStore';
import { getProfileByUid, getOrCreateProfile, getProfileByXtgId, getAllRegisteredMembers } from '../services/firebase/userService';
import { UniversalUserProfile, XtgAppKey } from '../types/user';

interface UseUserProfileResult {
  profile: UniversalUserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get the current user's universal profile
 */
export function useUserProfile(initialApp: XtgAppKey = 'leader'): UseUserProfileResult {
  const { user, loading: authLoading } = useAuthStore();
  const [profile, setProfile] = useState<UniversalUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get or create profile
      const userProfile = await getOrCreateProfile(user, initialApp);
      setProfile(userProfile);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  return {
    profile,
    loading: loading || authLoading,
    error,
    refetch: fetchProfile,
  };
}

/**
 * Hook to get a profile by xTheGospel ID (for leaders looking up members)
 */
export function useProfileByXtgId(xthegospelId: string | null): UseUserProfileResult {
  const [profile, setProfile] = useState<UniversalUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!xthegospelId) {
      setProfile(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userProfile = await getProfileByXtgId(xthegospelId);
      
      if (!userProfile) {
        setError('Perfil no encontrado');
      }
      
      setProfile(userProfile);
    } catch (err: any) {
      console.error('Error fetching profile by XTG ID:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [xthegospelId]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
}

/**
 * Hook to get all registered members (for leaders)
 */
export function useRegisteredMembers(limit: number = 50) {
  const [members, setMembers] = useState<UniversalUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profiles = await getAllRegisteredMembers(limit);
      setMembers(profiles);
    } catch (err: any) {
      console.error('Error fetching members:', err);
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [limit]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
  };
}

export default useUserProfile;
