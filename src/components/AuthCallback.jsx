// src/pages/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { supabase, handleSession } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get session from URL (after email verification, OAuth login, or password reset)
        const { data, error: urlError } = await supabase.auth.getSessionFromUrl(
          {
            storeSession: true, // Saves session to Supabase client
          }
        );

        if (urlError) {
          console.error('Auth callback error:', urlError);
          setError(urlError.message);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (data.session) {
          // Update your context/session state
          handleSession(data.session);

          console.log('✅ Auth callback successful');
          navigate('/app', { replace: true });
        } else {
          console.log('No session found, redirecting to home');
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('Authentication failed');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, supabase, handleSession]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            ❌ Authentication Error
          </div>
          <p className="text-white/60 mb-4">{error}</p>
          <p className="text-white/40 text-sm">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-white/60 mt-4">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
