// src/components/Sidebar.jsx

import React, { useEffect, useState } from 'react';
import { UserPenIcon, User, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedList from './AnimatedList';
import AuthComponent from './AuthComponent';

const Sidebar = ({ setShowCreateModal, isOpen, onClose }) => {
  const {
    isLoggedIn,
    accessToken,
    avatars,
    activeAvatar,
    setActiveAvatar,
    deleteAvatar,
    getAvatars,
  } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      getAvatars(accessToken);
    }
  }, [isLoggedIn]);

  const handleAvatarSelect = (avatar) => {
    setActiveAvatar(avatar);
    // Close sidebar on mobile when avatar is selected
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const handleCreateAvatar = () => {
    setShowCreateModal(true);
    // Close sidebar on mobile when creating new avatar
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  // Render each avatar with name, description, icons, delete button
  const renderAvatarItem = (avatar, index, isSelected) => (
    <div
      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors duration-300 ${
        isSelected
          ? 'bg-white-600 text-white'
          : 'hover:bg-teal-700 text-gray-300'
      } focus:outline focus:outline-2 focus:outline-teal-400`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setActiveAvatar(avatar);
        if (e.key === 'Delete') deleteAvatar(avatar.avatar_id);
      }}
      onClick={() => {
        setActiveAvatar(avatar);
        // Close sidebar on mobile when avatar is selected
        if (window.innerWidth < 1024) {
          onClose?.();
        }
      }}
    >
      <User className="w-6 h-6" />
      <div className="flex flex-col flex-grow">
        <span className="font-semibold break-words">{avatar.name}</span>
        <span className="text-xs text-gray-400 break-words">
          {avatar.description}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteAvatar(avatar.avatar_id);
        }}
        className="ml-auto text-red-400 hover:text-red-600 focus:outline focus:outline-2 focus:outline-red-400"
        aria-label={`Delete avatar ${avatar.name}`}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Sliding Panel */}
      <div
        className={`
        fixed lg:relative
        top-0 left-0
        w-80 sm:w-96 lg:w-full
        h-full lg:h-auto
        z-50 lg:z-auto
        bg-white/5 backdrop-blur-lg
        border-r border-white/20 lg:rounded-2xl lg:border
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-xl lg:shadow-none
      `}
      >
        <div className="flex flex-col h-full p-4 gap-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Avatars</h2>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Create Avatar Button */}
          {/* Auth Button Section */}
          {isLoggedIn ? (
            <button
              onClick={handleCreateAvatar}
              className="transition-transform duration-300 hover:scale-105 px-4 py-2 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 min-w-0 rounded px-3 py-2 border border-gray-700 text-white bg-black/35 from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-900 px-6 py-3 rounded-xl flex font-semibold gap-2 transition-all duration-300 transform shadow-lg items-center justify-center max-h-64 overflow-y-auto"
            >
              <UserPenIcon className="w-6 h-6" />
              <span className="portrait:hidden">Create Avatar</span>
            </button>
          ) : (
            <div className="flex items-center justify-center">
              <AuthComponent className="web:hidden" />
            </div>
          )}

          {/* /// */}

          {/* Avatar List */}
          <div className="flex-grow overflow-y-auto min-h-0 space-y-2">
            {Array.isArray(avatars) && avatars.length > 0 ? (
              avatars.map((avatar) => (
                <div
                  key={avatar.avatar_id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeAvatar?.avatar_id === avatar.avatar_id
                      ? 'bg-white/20 text-white shadow-lg scale-[1.02]'
                      : 'hover:bg-white/10 text-gray-300 hover:text-white'
                  }`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <User className="w-6 h-6" />
                  <div className="flex-grow min-w-0">
                    <div className="font-semibold text-sm sm:text-base truncate">
                      {avatar.name}
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-1">
                      {avatar.description}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAvatar(avatar.avatar_id);
                    }}
                    className="flex-shrink-0 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                    aria-label={`Delete avatar ${avatar.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm p-4 italic text-center">
                {isLoggedIn
                  ? 'No avatars available. Create one to get started.'
                  : 'No avatars available. Sign up or Log in to get started.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
