// components/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNgrokApiUrl } from './NgrokAPIContext';
import { AvatarService } from '../services/AvatarService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { ngrokHttpsUrl } = useNgrokApiUrl();
  console.log('AuthProvider Service call of ngrokHttpsUrl:', ngrokHttpsUrl);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [avatars, setAvatars] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && accessToken && ngrokHttpsUrl) {
      getAvatars(accessToken);
    }
  }, [isLoggedIn, accessToken, ngrokHttpsUrl]);

  const signup = async (username, email, password) => {
    const signupData = { username, email, password };
    console.log(
      'calling `${ngrokHttpsUrl}/neural-nexus-db/signup`, from AUTHCONTEXT'
    );
    const signupResponse = await fetch(
      `${ngrokHttpsUrl}/neural-nexus-db/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
        body: JSON.stringify(signupData),
      }
    );

    if (!signupResponse.ok) {
      const err = await signupResponse.json();
      throw new Error(err.detail || 'Signup failed');
    }

    const { access_token } = await signupResponse.json();
    console.log(
      'Calling `${ngrokHttpsUrl}/neural-nexus-db/profile`, from AUTHCONTEXT'
    );
    const profileResponse = await fetch(
      `${ngrokHttpsUrl}/neural-nexus-db/profile`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
      }
    );

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
    localStorage.setItem('avatars', JSON.stringify(profileData.avatars)); // Set Avatars
  };

  const login = async (email, password) => {
    const loginParams = new URLSearchParams();
    loginParams.append('username', email);
    loginParams.append('password', password);

    console.log(loginParams.toString());
    console.log(
      'calling `${ngrokHttpsUrl}/neural-nexus-db/login`, from AUTHCONTEXT'
    );
    const loginResponse = await fetch(
      `${ngrokHttpsUrl}/neural-nexus-db/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
        body: loginParams.toString(),
      }
    );

    if (!loginResponse.ok) {
      const err = await loginResponse.json();
      throw new Error(err.detail || 'Login failed');
    }

    const { access_token } = await loginResponse.json();
    console.log(
      'Calling `${ngrokHttpsUrl}/neural-nexus-db/profile`, from AUTHCONTEXT'
    );
    const profileResponse = await fetch(
      `${ngrokHttpsUrl}/neural-nexus-db/profile`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
      }
    );

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
    localStorage.setItem('avatars', JSON.stringify(profileData.avatars)); // Set Avatars
  };

  const logout = async () => {
    const token = localStorage.getItem('access_token');
    console.log(
      'calling `${ngrokHttpsUrl}/neural-nexus-db/logout`, from AUTHCONTEXT'
    );
    await fetch(`${ngrokHttpsUrl}/neural-nexus-db/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
    });
    setUser(null);
    setAccessToken(null);
    setIsLoggedIn(false);
    setAvatars([]);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('avatars');
  };

  const getAvatars = async (token = accessToken) => {
    if (!token || ngrokHttpsUrl === null) return;
    console.log(
      'Get Avatars of AuthContext call of ngrokHttpsUrl: ' +
        JSON.stringify(ngrokHttpsUrl)
    );
    console.log(
      'calling `${ngrokHttpsUrl}/neural-nexus-db/avatars/get_all`, from AUTHCONTEXT'
    );
    const res = await fetch(
      `${ngrokHttpsUrl}/neural-nexus-db/avatars/get_all`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
      }
    );
    if (!res.ok) {
      console.error('Failed to fetch avatars');
      return;
    }
    const data = await res.json();
    setAvatars(data);
  };

  const createAvatar = async ({ name, description = '' }) => {
    if (!accessToken) return;

    const newAvatarPayload = {
      name: name.trim(),
      description: description.trim(),
    };
    console.log(
      'Calling createAvatar from AuthContext: await AvatarService.createAvatar( '
    );
    try {
      const created = await AvatarService.createAvatar(
        accessToken,
        newAvatarPayload
      );
      setAvatars((prev) => [...prev, created]);
      return created;
    } catch (error) {
      console.error('Create avatar failed:', error);
    }
  };

  const deleteAvatar = async (avatarId) => {
    if (!accessToken) return;

    try {
      setAvatars((prev) => prev.filter((a) => a.id !== avatarId));
      const delete_response = await AvatarService.deleteAvatar(
        accessToken,
        avatarId
      );
      console.log('Delete avatar response:', JSON.stringify(delete_response));
      if (delete_response !== true) throw new Error('Failed to delete avatar');
      // ✅ Refetch avatars to update UI
      await getAvatars(accessToken);
    } catch (error) {
      console.error('AuthContext: Delete avatar failed:', error);
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
        getAvatars,
        createAvatar,
        deleteAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
