// /src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import CreateAvatarModal from './components/CreateAvatarModal';
import { useAuth } from './context/AuthContext';
import { useMedia } from './context/MediaContext';
import { Toaster } from 'react-hot-toast';

const AvatarChatApp = () => {
  const { activeAvatar } = useAuth();
  const {
    messages,
    sendMessage,
    messagesEndRef,
    inputMessage,
    dataExchangeTypes,
  } = useMedia();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDataExchangeDropdown, setShowDataExchangeDropdown] =
    useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false); // Default to hidden
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isFormElement =
        target.tagName === 'TEXTAREA' ||
        (target.tagName === 'INPUT' && !target.readOnly);

      // Prevent ALL keybindings inside text inputs
      if (isFormElement) return;

      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarVisible((v) => !v);
      }

      if (e.key === 'Escape') {
        setShowDataExchangeDropdown(false);
        setSidebarVisible(false);
      }

      // REMOVE this block entirely
      // if (e.shiftKey && e.key === 'Enter') {
      //   console.log('Shift + Enter detected');
      // }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDataExchangeDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputMessage, activeAvatar, dataExchangeTypes.text]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-green-900 text-white">
      <div className="w-screen h-screen flex flex-col gap-1">
        <Header
          sidebarVisible={sidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <div className="relative flex flex-grow overflow-hidden">
          <Sidebar
            setShowCreateModal={setShowCreateModal}
            isOpen={sidebarVisible}
            onClose={() => setSidebarVisible(false)}
          />

          <ChatArea
            className="flex flex-grow w-full h-full z-50"
            showDataExchangeDropdown={showDataExchangeDropdown}
            setShowDataExchangeDropdown={setShowDataExchangeDropdown}
            dropdownRef={dropdownRef}
          />
        </div>
        {showCreateModal && (
          <CreateAvatarModal setShowCreateModal={setShowCreateModal} />
        )}
      </div>
    </div>
  );
};

export default AvatarChatApp;
