import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService';

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated) {
        setUser(null);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message || 'Failed to fetch user data');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [isAuthenticated]);

  const refetch = () => {
    fetchUser();
  };

  return {
    user,
    loading,
    error,
    refetch
  };
};