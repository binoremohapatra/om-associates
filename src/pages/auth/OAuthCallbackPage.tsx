import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, setAuthToken } from '../../lib/api';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (token) {
        try {
          setAuthToken(token);
          const res = await api.get('/auth/me');
          login(token, res.data.data.user);
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error('Failed to fetch user after OAuth:', error);
          navigate('/login?error=oauth_failed', { replace: true });
        }
      } else {
        navigate('/login?error=no_token', { replace: true });
      }
    };
    fetchUser();
  }, [location, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#C9A94B]/30 border-t-[#C9A94B] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
