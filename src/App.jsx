import React, { useState, useEffect, useRef } from 'react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import CreateAvatarModal from './components/CreateAvatarModal';
import { useAuth } from './context/AuthContext';
import { useMedia } from './context/MediaContext';

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
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const dropdownRef = useRef(null);
  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeAvatar]);

  // Handle keyboard shortcuts and dropdown close on click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarVisible((v) => !v);
      }
      // if (
      //   e.key === 'Enter' &&
      //   !e.shiftKey &&
      //   activeAvatar &&
      //   dataExchangeTypes.text
      // ) {
      //   e.preventDefault();
      //   sendMessage();
      // }
      if (e.key === 'Escape') {
        setShowDataExchangeDropdown(false);
      }
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
      <div className="w-screen h-screen flex flex-col p-4 sm:p-6 min-h-screen gap-2">
        <Header
          sidebarVisible={sidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <div className="flex flex-col lg:flex-row flex-grow overflow-hidden rounded-2xl shadow-lg gap-4">
          {sidebarVisible && (
            <div className="lg:block w-full lg:w-1/4 max-h-[50vh] lg:max-h-full overflow-y-auto">
              <Sidebar setShowCreateModal={setShowCreateModal} />
            </div>
          )}
          <ChatArea
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
