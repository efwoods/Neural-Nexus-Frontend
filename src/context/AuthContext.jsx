import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNgrokApiUrl } from './NgrokAPIContext';
import { AvatarService } from '../services/AvatarService';
import toast from 'react-hot-toast';
import { duration } from '@mui/material';
import { X } from 'lucide-react';

// Initialize Supabase client with publishable key (safe for browser)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { dbHttpsUrl } = useNgrokApiUrl();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [activeAvatar, setActiveAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Supabase auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSession(session);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      if (event === 'SIGNED_IN' && session) {
        await handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        handleSignOut();
      } else if (event === 'USER_UPDATED') {
        // Handle email verification completion
        if (session?.user?.email_confirmed_at) {
          toast.success('Email verified successfully!');
          await handleSession(session);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [dbHttpsUrl]);

  // Fetch MongoDB profile when session exists
  const handleSession = async (session) => {
    try {
      setAccessToken(session.access_token);
      localStorage.setItem('access_token', session.access_token);

      // Fetch MongoDB user profile
      const profileResponse = await fetch(`${dbHttpsUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Accept: 'application/json',
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      setUser(profileData);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(profileData));

      if (profileData.last_used_avatar) {
        setActiveAvatar({ avatar_id: profileData.last_used_avatar });
      }

      // Fetch avatars
      await getAvatars(session.access_token);
    } catch (error) {
      console.error('Session handling error:', error);
      // toast.error('Failed to load user profile');
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setAccessToken(null);
    setIsLoggedIn(false);
    // setAvatars([]);
    setActiveAvatar(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('avatars');
  };

  const signup = async (username, email, password) => {
    try {
      // Backend handles everything now
      const response = await fetch(`${dbHttpsUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to sign up');
      }

      const data = await response.json();
      if (data.message === 'Login successful') {
      }
      toast.success(
        data.message ||
          'Signup successful! Please check your email to verify your account.',
        { duration: Infinity }
      );

      return data;
    } catch (error) {
      console.error('Signup error:', error);

      // Display user-friendly error messages
      if (error.message?.includes('already registered')) {
        toast.error('This email is already registered');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Please provide a valid email address');
      } else if (error.message?.includes('Password')) {
        toast.error('Password must be at least 6 characters');
      } else {
        toast.error(error.message || 'Signup failed. Please try again.');
      }

      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if email is verified
      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('Please verify your email before logging in');
      }

      toast.success('Login successful!');
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Update MongoDB FIRST (while token is still valid)
      if (accessToken) {
        await fetch(`${dbHttpsUrl}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      // THEN sign out from Supabase
      await supabase.auth.signOut();

      handleSignOut();
      // toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still sign out locally even if backend fails
      await supabase.auth.signOut();
      handleSignOut();
      toast.error('Logout completed with errors');
    }
  };

  const resendVerification = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      toast.success(
        (t) => (
          <div className="relative flex flex-col gap-2 p-4 ">
            {/* Text + X button in one row */}
            <div className="flex justify-between items-start">
              {/* Message */}
              <p className="pr-4">Verification email sent!</p>

              {/* X button top-right */}
              <button
                onClick={() => toast.dismiss(t.id)}
                className="p-1 bg-red-600 hover:bg-red-500 rounded text-sm"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    } catch (error) {
      if (error?.name === 'AuthApiError') {
        toast.error(
          (t) => (
            <div className="relative flex flex-col gap-2 p-4">
              {/* Text + X button in one row */}
              <div className="flex justify-between items-start">
                {/* Message */}
                <p className="pr-4">{error.message}</p>

                {/* X button top-right */}
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="p-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ),
          { duration: Infinity }
        );
      } else {
        // handle other errors
        console.error('Resend verification error:', error);
        throw error;
      }
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      // Don't show toast here - let AuthComponent handle it
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  // Social login
  const signInWithProvider = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`${provider} login failed`);
    }
  };

  const getAvatars = async (token = accessToken) => {
    if (!token || !dbHttpsUrl) return;

    try {
      const res = await fetch(`${dbHttpsUrl}/management/avatars/get_all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch avatars');
        return;
      }

      const data = await res.json();
      setAvatars(data);
      localStorage.setItem('avatars', JSON.stringify(data));

      if (user?.last_used_avatar) {
        const lastUsed = data.find(
          (a) => a.avatar_id === user.last_used_avatar
        );
        if (lastUsed) setActiveAvatar(lastUsed);
      }
    } catch (error) {
      console.error('Get avatars error:', error);
    }
  };

  const createAvatar = async ({ name, description = '' }) => {
    if (!accessToken) return;

    const newAvatarPayload = {
      name: name.trim(),
      description: description.trim(),
    };

    try {
      const created = await AvatarService.createAvatar(
        accessToken,
        newAvatarPayload
      );
      setAvatars((prev) => [...prev, created]);
      setActiveAvatar(created);
      await AvatarService.selectAvatar(accessToken, created.avatar_id);
      return created;
    } catch (error) {
      console.error('Create avatar failed:', error);
    }
  };

  const deleteAvatar = async (avatarId) => {
    if (!accessToken) return;

    try {
      const delete_response = await AvatarService.deleteAvatar(
        accessToken,
        avatarId
      );
      if (delete_response.status !== 'success')
        throw new Error('Failed to delete avatar');

      await getAvatars(accessToken);
      if (activeAvatar?.avatar_id === avatarId) {
        setActiveAvatar(null);
      }
    } catch (error) {
      console.error('Delete avatar failed:', error);
    }
  };

  const selectAvatar = async (avatarId) => {
    if (!accessToken) return;

    try {
      const response = await AvatarService.selectAvatar(accessToken, avatarId);
      if (response.status === 'success') {
        const selectedAvatar = avatars.find((a) => a.avatar_id === avatarId);
        setActiveAvatar(selectedAvatar);
        setUser((prev) => ({ ...prev, last_used_avatar: avatarId }));
        localStorage.setItem(
          'user',
          JSON.stringify({ ...user, last_used_avatar: avatarId })
        );
      }
    } catch (error) {
      console.error('Select avatar failed:', error);
    }
  };

  const updateActiveAvatarField = (field, value) => {
    setActiveAvatar((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        accessToken,
        login,
        signup,
        logout,
        avatars,
        activeAvatar,
        setActiveAvatar,
        getAvatars,
        createAvatar,
        deleteAvatar,
        selectAvatar,
        resendVerification,
        forgotPassword,
        updatePassword,
        updateActiveAvatarField,
        signInWithProvider, // For social login
        supabase, // Expose for advanced use
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
