// components/ChatArea.jsx

import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import LiveTranscriptionTicker from './LiveTranscriptionTicker';
import AudioStreamer from './AudioStreamer';
import MessageList from './MessageList';
import InputBar from './InputBar';
import { useAuth } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';
import { Toaster } from 'react-hot-toast';
import DocumentPane from './DocumentPane';

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
    fileInputRef,
    handleFileUpload,
  } = useMedia();

  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (activeAvatar && accessToken) {
      fetchMessages();
    }
  }, [activeAvatar?.avatar_id]);

  return (
    <div className="flex flex-row flex-grow bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
      {/* Main Chat Section */}
      <div className="flex flex-col flex-grow p-2 sm:p-4 relative">
        <Toaster
          position="top-center"
          reverseOrder={true}
          toastOptions={{
            success: {
              style: { background: 'transparent', color: 'white' },
            },
            loading: {
              style: { background: 'transparent', color: 'white' },
            },
          }}
        />
        <LiveTranscriptionTicker isTranscribing={isTranscribing} />
        <AudioStreamer isTranscribing={isTranscribing} />

        {!activeAvatar && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20">
            <div className="text-center">
              <User className="w-64 h-64 bg-transparent mx-auto mb-4 text-gray-400 sm:w-32 sm:h-32" />
              <h2 className="text-2xl font-semibold mb-2">Select an Avatar</h2>
              <p className="text-gray-400 break-words p-1">
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
            <div className="flex gap-2 items-center relative w-full">
              <InputBar
                avatarId={activeAvatar.avatar_id}
                accessToken={accessToken}
                dropdownRef={dropdownRef}
              />
            </div>
          </>
        )}
      </div>

      {/* Document Pane Sidebar */}
      {activeAvatar && (
        <div className="w-[350px] border-l border-white/10 overflow-y-auto">
          <DocumentPane
            avatarId={activeAvatar.avatar_id}
            accessToken={accessToken}
          />
        </div>
      )}
    </div>
  );
};

export default ChatArea;
