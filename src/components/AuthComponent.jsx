import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { LogIn, LogOut, LogOutIcon, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';
import VantaBackground from './VantaBackground';
import { LucideLogOut } from 'lucide-react';

const modalRoot =
  document.getElementById('modal-root') ||
  (() => {
    const el = document.createElement('div');
    el.id = 'modal-root';
    document.body.appendChild(el);
    return el;
  })();

const AuthComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const {
    user,
    isLoggedIn,
    accessToken,
    login,
    signup,
    logout,
    setActiveAvatar,
  } = useAuth();
  const { messages, setMessages } = useMedia();

  // Dropdown state for user menu
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await signup(username, email, password);
      } else {
        await login(email, password);
      }
      setUsername('');
      setEmail('');
      setPassword('');
      setShowModal(false);
    } catch (error) {
      alert(`Auth Error: ${error.message}`);
      console.error('Authentication error:', error);
    }
  };

  const handleLogout = () => {
    setMessages('');
    setActiveAvatar('');
    logout();
    setDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Modal JSX as a Portal child (unchanged)
  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[999]">
      <VantaBackground />
      <div
        className="absolute inset-0"
        onClick={() => setShowModal(false)}
        style={{ zIndex: 1 }}
      />
      <div
        className="relative z-10 p-6 rounded-xl shadow-lg w-96 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          {isSignup ? 'Signup' : 'Login'}
        </h2>
        <form onSubmit={handleAuth}>
          {isSignup && (
            <div className="mb-4">
              <label className="block text-white mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-white mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-white/5 hover:bg-red-900 rounded-lg text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-white/5 hover:bg-teal-600 rounded-lg text-white"
            >
              {isSignup ? 'Signup' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="relative flex items-center space-x-4">
      {isLoggedIn ? (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/5 rounded-full text-white transition focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-controls="user-menu"
          >
            <span>{user?.username}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              id="user-menu"
              role="menu"
              className="absolute right-0 mt-2 w-32 bg-gray-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            >
              <button
                onClick={handleLogout}
                className="block w-full text-left flex flex-row items-center px-4 py-2 text-sm text-red-500 hover:bg-red-900 hover:text-white transition"
                role="menuitem"
              >
                Logout <LogOutIcon className="ml-2" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button
            onClick={() => {
              setIsSignup(true);
              setShowModal(true);
            }}
            className="text-sm px-2 sm:px-4 py-1 sm:py-2 transition-transform duration-300 hover:scale-105 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 border border-gray-700 text-white bg-black/35 font-semibold shadow-lg flex items-center justify-center"
          >
            <UserPlus size={16} />
            <span className="portrait:hidden landscape:ml-2">Signup</span>
          </button>

          <button
            onClick={() => {
              setIsSignup(false);
              setShowModal(true);
            }}
            className="text-sm px-2 sm:px-4 py-1 sm:py-2 transition-transform duration-300 hover:scale-105 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 border border-gray-700 text-white bg-black/35 font-semibold shadow-lg flex items-center justify-center"
          >
            <LogIn size={16} />
            <span className="portrait:hidden landscape:ml-2">Login</span>
          </button>
        </>
      )}

      {showModal && ReactDOM.createPortal(modalContent, modalRoot)}
    </div>
  );
};

export default AuthComponent;
