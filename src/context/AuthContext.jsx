import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNgrokApiUrl } from './NgrokAPIContext';
import { AvatarService } from '../services/AvatarService';
import { useMedia } from './MediaContext';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { dbHttpsUrl } = useNgrokApiUrl();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [activeAvatar, setActiveAvatar] = useState(null);
  const [loginResponse, setLoginResponse] = useState(false);
  const [signupResponse, setSignupResponse] = useState(false);

  // Update any field safely
  const updateActiveAvatarField = (field, value) => {
    setActiveAvatar((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    console.log('update');
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setAccessToken(storedToken);
      setIsLoggedIn(true);
      if (userData.last_used_avatar) {
        setActiveAvatar({
          avatar_id: userData.last_used_avatar,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && accessToken && dbHttpsUrl) {
      getAvatars(accessToken);
    }
  }, [isLoggedIn, accessToken, dbHttpsUrl]);

  useEffect(() => {
    const handleVerification = async () => {
      const params = new URLSearchParams(window.location.search);
      const verification = params.get('verification');
      const reason = params.get('reason');
      const autoLoginToken = params.get('token');

      if (verification === 'success' && autoLoginToken) {
        try {
          // Store the token
          setAccessToken(autoLoginToken);
          localStorage.setItem('access_token', autoLoginToken);

          // Fetch user profile
          const profileResponse = await fetch(`${dbHttpsUrl}/profile`, {
            headers: {
              Authorization: `Bearer ${autoLoginToken}`,
              Accept: 'application/json',
            },
          });

          if (!profileResponse.ok) {
            throw new Error('Failed to fetch profile');
          }

          const profileData = await profileResponse.json();

          // Set user data
          setUser(profileData);
          localStorage.setItem('user', JSON.stringify(profileData));
          localStorage.setItem('avatars', JSON.stringify(profileData.avatars));
          setIsLoggedIn(true);

          if (profileData.last_used_avatar) {
            setActiveAvatar({ avatar_id: profileData.last_used_avatar });
          }
        } catch (error) {
          console.error('Auto-login failed:', error);
          toast.error(
            'Verification successful but login failed. Please log in manually.'
          );
        }

        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (verification === 'failed') {
        if (reason === 'expired') {
          toast.error(
            '⏰ Verification link expired. Please request a new one.',
            {
              duration: 6000,
            }
          );
        } else if (reason === 'invalid') {
          toast.error('❌ Invalid verification link.', {
            duration: 6000,
          });
        } else {
          toast.error('❌ Verification failed. Please try again.', {
            duration: 6000,
          });
        }

        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (verification === 'error') {
        toast.error('❌ An error occurred. Please try again.', {
          duration: 6000,
        });

        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    handleVerification();
  }, [dbHttpsUrl]); // Dependencies as needed

  const signup = async (username, email, password) => {
    const signupData = { username, email, password };
    try {
      const signupResponse = await fetch(`${dbHttpsUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!signupResponse.ok) {
        const err = await signupResponse.json();
        throw new Error(err.detail || 'Signup failed');
      }
    } catch (err) {
      if (err.detail == 'Email already registered and verified.') {
        toast.message('Email already registered and verified. Logging in...');
      }
      try {
        await login(email, password);
        toast.success(
          'Email already registered and verified. AutoLogin Successful!'
        );
      } catch (err) {
        throw new Error(err.detail || 'AutoLogin failed');
      }
    }
  };

  const login = async (email, password) => {
    const loginParams = new URLSearchParams();
    loginParams.append('username', email);
    loginParams.append('password', password);

    const loginResponse = await fetch(`${dbHttpsUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: loginParams.toString(),
    });

    if (!loginResponse.ok) {
      const err = await loginResponse.json();
      throw new Error(err.detail || 'Login failed');
    }

    const { access_token } = await loginResponse.json();
    const profileResponse = await fetch(`${dbHttpsUrl}/profile`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
      },
    });

    if (!profileResponse.ok) {
      const errText = await profileResponse.text();
      throw new Error(errText || 'Failed to fetch profile');
    }

    const profileData = await profileResponse.json();
    setUser(profileData);
    setAccessToken(access_token);
    setIsLoggedIn(true);

    localStorage.setItem('user', JSON.stringify(profileData));
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('avatars', JSON.stringify(profileData.avatars));

    if (profileData.last_used_avatar) {
      setActiveAvatar({ avatar_id: profileData.last_used_avatar });
    }
    setIsLoggedIn(true);
  };

  const logout = async () => {
    const token = localStorage.getItem('access_token');
    await fetch(`${dbHttpsUrl}/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    setUser(null);
    setAccessToken(null);
    setIsLoggedIn(false);
    setAvatars([]);
    setActiveAvatar(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('avatars');
  };

  const resendVerification = async (email) => {
    try {
      const response = await fetch(`${dbHttpsUrl}/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // ← FastAPI reads this as JSON
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend');
      }

      toast.success(data.message);
    } catch (err) {
      throw new Error(err.message || "Couldn't resend email");
    }
  };

  const forgotPassword = async (newPassword) => {
    console.log(localStorage.getItem('email'));
    try {
      const email = localStorage.getItem('email');
      if (email == null) {
        console.log('email is null');
        throw new Error('Email is null.');
      } else {
        console.log('email not null');
        localStorage.removeItem('email');
      }

      const response = await fetch(`${dbHttpsUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend');
      }
      toast.success(data.message);
    } catch (err) {
      console.log('throwing error in forgotPassword');
      throw new Error(err.message || "Couldn't resend email");
    }
  };

  const getAvatars = async (token = accessToken) => {
    if (!token || !dbHttpsUrl) return;
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
    if (user?.last_used_avatar) {
      const lastUsed = data.find((a) => a.avatar_id === user.last_used_avatar);
      if (lastUsed) setActiveAvatar(lastUsed);
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
      setActiveAvatar(created); // Set as active avatar
      await AvatarService.selectAvatar(accessToken, created.avatar_id); // Update last_used_avatar
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
      await getAvatars(accessToken); // Refetch avatars
      if (activeAvatar?.avatar_id === avatarId) {
        setActiveAvatar(null); // Clear active avatar if deleted
      }
    } catch (error) {
      console.error('AuthContext: Delete avatar failed:', error);
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
        loginResponse,
        signupResponse,
        resendVerification,
        forgotPassword,
        updateActiveAvatarField,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
