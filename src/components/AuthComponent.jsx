import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  LogIn,
  LogOut,
  LogOutIcon,
  UserPlus,
  UserIcon,
  X,
  ArrowLeft,
  ClipboardPen,
  LogInIcon,
  SendIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';
import VantaBackground from './VantaBackground';
import LoadingSpinner from './LoadingSpinner';
import { toast, Toaster } from 'react-hot-toast';

const modalRoot =
  document.getElementById('modal-root') ||
  (() => {
    const el = document.createElement('div');
    el.id = 'modal-root';
    document.body.appendChild(el);
    return el;
  })();

const AuthComponent = ({ setActiveTab, onEndLiveChat }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(true);
  const [showSignupButton, setShowSignupButton] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [
    showResendVerificationEmailButton,
    setShowResendVerificationEmailButton,
  ] = useState(false);
  const {
    user,
    isLoggedIn,
    accessToken,
    login,
    signup,
    logout,
    setActiveAvatar,
    loginResponse,
    signupResponse,
    resendVerification,
  } = useAuth();
  const { messages, setMessages } = useMedia();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (showSignupModal) {
        try {
          setShowSignupModal(false);
          // setShowVerifyModal(true);
          // setIsLoading(true);
          setShowVerifyEmailModal(true);
          // setShowResendVerificationEmailButton(true);
          setShowLoginButton(false);
          setShowSignupButton(false);
          await signup(username, email, password);
          // on successful signup logic but not yet verified
          setShowVerifyModal(false);
          setIsLoading(false);
        } catch (err) {
          // toast.err(err.message);
          toast(
            (t) => (
              <div className="flex flex-col items-center justify-center bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                {err.message == 'Email already registered and verified.' && (
                  <>
                    {/* Verified and Registered*/}
                    {/* auto-login */}
                    <p className="mb-2">{err.message}</p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                        onClick={() => {
                          toast.dismiss(t.id);
                          setShowLoginButton(true);
                        }}
                      >
                        Dismiss
                      </button>

                      <button
                        className="px-3 py-1 flex flex-row bg-teal-600 hover:bg-teal-700 rounded"
                        onClick={() => {
                          // retryLogin(); auto-login
                          toast.dismiss(t.id);
                          setShowLoginButton(true);
                          setShowLoginModal(true);
                          setShowVerifyModal(false);
                          setIsLoading(false);
                          setShowSignupModal(false);
                        }}
                      >
                        Login <LogInIcon />
                      </button>
                    </div>
                  </>
                )}
                {err.message ==
                  'Email already registered. Please check your email for verification link or request a new one.' && (
                  <>
                    <p className="mb-2">{err.message}</p>
                    <div className="flex items-center justify-center gap-2">
                      {/* Registered but not verified */}
                      <button
                        className="text-sm px-2 sm:px-4 py-1 sm:py-2 transition-transform duration-300 hover:scale-105 rounded bg-red-600 hover:bg-red-700  transition-colors focus:outline focus:outline-2 focus:outline-red-400 border border-gray-700 text-white bg-black/35 font-semibold shadow-lg flex items-center justify-center"
                        onClick={() => {
                          toast.dismiss(t.id);
                          setShowSignupButton(true);
                        }}
                      >
                        Dismiss
                      </button>

                      <button
                        className="px-3 py-1 flex flex-row bg-teal-600 hover:bg-teal-700 rounded gap-2"
                        onClick={() => {
                          // retryLogin(); resendVerification();
                          resendVerification(email);
                          toast.dismiss(t.id);
                          setShowSignupButton(true);
                        }}
                      >
                        Resend <SendIcon size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setShowSignupModal(false);
                          setShowLoginModal(true);
                          setShowVerifyModal(false);
                          setIsLoading(false);
                          setShowLoginButton(true);
                          setShowSignupButton(false);
                          setShowChangePasswordModal(false);
                          setShowVerifyEmailModal(false);
                          setEmail('');
                          setUsername('');
                          setPassword('');
                          toast.dismiss(t.id);
                        }}
                        className="text-sm px-2 sm:px-4 py-1 sm:py-2 transition-transform duration-300 hover:scale-105 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 border border-gray-700 text-white bg-black/35 font-semibold shadow-lg flex items-center justify-center"
                      >
                        <LogIn size={16} />
                        <span className="ml-2">Login</span>
                      </button>
                    </div>
                  </>
                )}
                {err.message !=
                  'Email already registered. Please check your email for verification link or request a new one.' &&
                  err.message != 'Email already registered and verified.' && (
                    <>
                      {/* Catch-All Signup Errors*/}
                      <p className="mb-2">{err.message}</p>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                          onClick={() => {
                            toast.dismiss(t.id);
                            setShowLoginButton(true);
                          }}
                        >
                          Dismiss
                        </button>

                        <button
                          className="px-3 py-1 flex flex-row bg-teal-600 hover:bg-teal-700 rounded"
                          onClick={() => {
                            // retryLogin(); auto-login
                            toast.dismiss(t.id);
                            setShowLoginButton(true);
                            setShowLoginModal(true);
                            setShowVerifyModal(false);
                            setIsLoading(false);
                            setShowSignupModal(false);
                          }}
                        >
                          Login <LogInIcon />
                        </button>
                      </div>
                    </>
                  )}
              </div>
            ),
            { duration: Infinity }
          );
        }
      }
      if (showLoginModal) {
        try {
          setShowLoginModal(false);
          setShowLoginButton(false);
          setShowVerifyModal(true);
          setIsLoading(true);
          setShowResendVerificationEmailButton(false);
          await login(email, password, setActiveTab);
        } catch (err) {
          toast(
            (t) => (
              <div className="flex flex-col items-center justify-center bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                {err.message ==
                  'NetworkError when attempting to fetch resource.' && (
                  <>
                    {/* Verified, but password fails */}

                    <p className="mb-2">Could not log in. Please try again.</p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                        onClick={() => {
                          toast.dismiss(t.id);
                          setShowLoginModal(true);
                          setShowLoginButton(true);
                          setShowVerifyModal(false);
                          setIsLoading(false);
                        }}
                      >
                        Dismiss
                      </button>
                      <form onSubmit={handleAuth}>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded gap-2"
                          onClick={() => {
                            toast.dismiss(t.id);
                            setShowLoginModal(true);
                            setShowLoginButton(false);
                          }}
                        >
                          Retry
                        </button>
                      </form>
                    </div>
                  </>
                )}

                {err.message ==
                  'Please verify your email before logging in. Check your inbox for the verification link.' && (
                  <>
                    {/* Not Verified */}
                    <p className="mb-2">Account Not Verified</p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                        onClick={() => {
                          toast.dismiss(t.id);
                          setShowLoginButton(true);
                        }}
                      >
                        Dismiss
                      </button>
                      <button
                        className="px-3 py-1 flex flex-row bg-teal-600 hover:bg-teal-700 rounded"
                        onClick={() => {
                          resendVerification(email);
                          toast.dismiss(t.id);
                          setShowLoginButton(true);
                        }}
                      >
                        Resend Email <SendIcon />
                      </button>
                    </div>
                  </>
                )}
                {err.message == 'Invalid email or password.' && (
                  <>
                    {/* Verified, but password fails */}
                    <p className="mb-2">Invalid email or password.</p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                        onClick={() => {
                          toast.dismiss(t.id);
                          setShowLoginButton(true);
                        }}
                      >
                        Dismiss
                      </button>
                      <button
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded"
                        onClick={() => {
                          // retryLogin(); Forgot Password?
                          toast.dismiss(t.id);
                          setShowLoginButton(true);
                          setShowVerifyModal(true);
                          setIsLoading(true);
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </>
                )}
                {err.message != 'Invalid email or password.' &&
                  err.message !=
                    'Please verify your email before logging in. Check your inbox for the verification link.' && (
                    <>
                      {/* Catch-All Login Errors*/}
                      <p className="mb-2">{err.message}</p>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                          onClick={() => {
                            toast.dismiss(t.id);
                            setShowLoginButton(true);
                          }}
                        >
                          Dismiss
                        </button>

                        <button
                          className="px-3 py-1 flex flex-row bg-teal-600 hover:bg-teal-700 rounded"
                          onClick={() => {
                            // retryLogin(); auto-login
                            toast.dismiss(t.id);
                            setShowLoginButton(true);
                            setShowLoginModal(true);
                            setShowVerifyModal(false);
                            setIsLoading(false);
                            setShowSignupModal(false);
                          }}
                        >
                          Retry <LogInIcon />
                        </button>
                      </div>
                    </>
                  )}
              </div>
            ),
            {
              duration: Infinity,
            }
          );

          setShowLoginModal(true);
          setShowVerifyModal(false);
          setIsLoading(false);
          await login(email, password, setActiveTab);
        }
      }

      if (showVerifyModal && !loginResponse) {
        setShowLoginModal(true);
        setShowVerifyModal(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleLogout = () => {
    setMessages('');
    setActiveAvatar(null);
    logout();
    setDropdownOpen(false);
    onEndLiveChat?.();
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

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[999]">
      <VantaBackground />
      <Toaster position="top-center" />
      <div
        className="absolute inset-0"
        onClick={() => setShowModal(false)}
        style={{ zIndex: 1 }}
      />
      <div
        className="relative z-10 p-6 rounded-xl shadow-lg w-96 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          {showSignupModal && (
            <h2 className="text-2xl font-bold text-white mb-4">Signup</h2>
          )}
          {showLoginModal && (
            <h2 className="text-2xl font-bold text-white mb-4">Login</h2>
          )}
          {showVerifyModal && (
            <h2 className="text-2xl font-bold text-white mb-4">Verifying</h2>
          )}
          {showVerifyEmailModal && (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">
                Verify Email
              </h2>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              toast.dismiss();
              setShowModal(false);
              setShowSignupModal(false);
              setShowLoginModal(false);
              setShowVerifyModal(false);
              setIsLoading(false);
              setShowResendVerificationEmailButton(false);
            }}
            className="px-4 py-2 bg-white/5 hover:bg-red-900 rounded-lg text-white"
          >
            <X />
          </button>
        </div>
        <div className="flex flex-row items-center justify-center">
          {isLoading && <LoadingSpinner />}
        </div>
        {showVerifyEmailModal && (
          <p>
            A verification email has been sent to your inbox. Please click the
            link to verify your email before logging in.
          </p>
        )}
        <form onSubmit={handleAuth}>
          {(showSignupModal || showVerifyEmailModal) && (
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
          <div className="flex flex-row justify-center space-x-3">
            {/* Buttons at bottom of modal */}
            {/* <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-white/5 hover:bg-red-900 rounded-lg text-white"
            >
              Cancel
            </button> */}
            {/* Submit Button: Either Signup or Login */}
            {showResendVerificationEmailButton && (
              // <div className="flex flex-row justify-between mb-4">
              <button
                type="submit"
                className="px-4 py-2 bg-white/5 hover:bg-teal-600 rounded-lg text-white flex flex-row gap-2"
              >
                Resend Verification Email <SendIcon />
              </button>
              // </div>
            )}
            {showSignupButton && (
              // <div className="flex flex-row justify-between mb-4">
              <button
                type="submit"
                className="px-4 py-2 bg-white/5 hover:bg-teal-600 rounded-lg text-white flex flex-row gap-2"
              >
                Sign Up <ClipboardPen />
              </button>
              // </div>
            )}
            {showLoginButton && (
              <button
                type="submit"
                className="flex flew-row px-4 py-2 bg-white/5 hover:bg-teal-600 rounded-lg text-white gap-2"
              >
                Login <UserIcon />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="relative flex items-center justify-center space-x-4">
      {isLoggedIn ? (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                onClick={() => {
                  onEndLiveChat?.();
                  setActiveTab('account');
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-teal-600 transition"
                role="menuitem"
              >
                Account Settings
              </button>
              <button
                onClick={() => {
                  setActiveTab('billing');
                  onEndLiveChat?.();
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-teal-600 transition"
                role="menuitem"
              >
                Billing
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left flex flex-row items-center px-4 py-2 text-sm text-red-500 hover:bg-red-900 hover:text-white transition"
                role="menuitem"
              >
                Logout <LogOutIcon className="ml-2 w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button
            onClick={() => {
              setShowModal(true);
              setShowSignupModal(true);
              setShowSignupButton(true);
              setShowLoginModal(false);
              setShowLoginButton(false);
              setShowVerifyModal(false);
              setIsLoading(false);
              setShowChangePasswordModal(false);
              setShowVerifyEmailModal(false);
              setEmail('');
              setUsername('');
              setPassword('');
            }}
            className="text-sm px-2 sm:px-4 py-1 sm:py-2 transition-transform duration-300 hover:scale-105 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 border border-gray-700 text-white bg-black/35 font-semibold shadow-lg flex items-center justify-center"
          >
            <UserPlus size={16} />
            <span className="ml-2">Signup</span>
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              setShowSignupModal(false);
              setShowLoginModal(true);
              setShowVerifyModal(false);
              setIsLoading(false);
              setShowLoginButton(true);
              setShowSignupButton(false);
              setShowChangePasswordModal(false);
              setShowVerifyEmailModal(false);
              setEmail('');
              setUsername('');
              setPassword('');
            }}
            className="text-sm px-2 sm:px-4 py-1 sm:py-2 transition-transform duration-300 hover:scale-105 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 border border-gray-700 text-white bg-black/35 font-semibold shadow-lg flex items-center justify-center"
          >
            <LogIn size={16} />
            <span className="ml-2">Login</span>
          </button>
        </>
      )}
      {showModal && ReactDOM.createPortal(modalContent, modalRoot)}
    </div>
  );
};

export default AuthComponent;
