// components/ChatArea.jsx

import React, { useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import LiveTranscriptionTicker from './LiveTranscriptionTicker';
import AudioStreamer from './AudioStreamer';
import MessageList from './MessageList';
import InputBar from './InputBar';
import { useAuth } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';
import NeuralNexusLogo from '../assets/NeuralNexus.png';
const ChatArea = ({
  showDataExchangeDropdown,
  setShowDataExchangeDropdown,
  dropdownRef,
}) => {
  const {
    isLoggedIn,
    accessToken,
    avatars,
    activeAvatar,
    setActiveAvatar,
    deleteAvatar,
    getAvatars,
  } = useAuth();

  const {
    messages,
    setMessages,
    fetchMessages,
    messagesEndRef,
    inputMessage,
    setInputMessage,
    sendMessage,
    isTranscribing,
    isThoughtToImageEnabled,
    dataExchangeTypes,
    toggleDataExchangeType,
    fileInputRef,
    handleFileUpload,
  } = useMedia();

  useEffect(() => {
    // Now, anytime a user selects an avatar in Sidebar.jsx, the activeAvatar changes, and the ChatArea will auto-fetch messages from:
    //   Redis if cached
    //   MongoDB if not cached

    fetchMessages();
  }, [activeAvatar, accessToken]);

  return (
    <div className="flex flex-col flex-grow bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-2 sm:p-4 overflow-hidden">
      <LiveTranscriptionTicker isTranscribing={isTranscribing} />
      <AudioStreamer isTranscribing={isTranscribing} />
      {!activeAvatar && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20">
          <div className="text-center">
            {/* <User size={64} className="mx-auto mb-4 text-gray-400" /> */}
            <img
              src={NeuralNexusLogo}
              alt="Logo"
              className="w-64 h-64 bg-transparent mx-auto mb-4 text-gray-400 sm:w-32 sm:h-32"
              size={64}
            />

            <h2 className="text-2xl font-semibold mb-2">Select an Avatar</h2>
            <p className="text-gray-400 break-words">
              Choose an avatar from the sidebar or create a new one to start
              chatting
            </p>
          </div>
        </div>
      )}
      {activeAvatar && (
        <>
          <MessageList
            messages={messages[activeAvatar.avatar_id] || []}
            messagesEndRef={messagesEndRef}
          />
          <div className="flex gap-2 items-center relative">
            <InputBar
              avatarId={activeAvatar.avatar_id}
              accessToken={accessToken}
              setShowDataExchangeDropdown={setShowDataExchangeDropdown}
              showDataExchangeDropdown={showDataExchangeDropdown}
              dropdownRef={dropdownRef}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatArea;
