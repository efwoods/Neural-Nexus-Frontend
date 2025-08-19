// components/ChatArea.jsx
import React, { useEffect, useState } from 'react';
import { User, AudioLines } from 'lucide-react';
import LiveTranscriptionTicker from './LiveTranscriptionTicker';
import AudioStreamer from './AudioStreamer';
import MessageList from './MessageList';
import InputBar from './InputBar';
import { useAuth } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';
import AvatarSettings from './AvatarSettings';

const ChatArea = ({
  showDataExchangeDropdown,
  setShowDataExchangeDropdown,
  dropdownRef,
  activeTab,
  setActiveTab,
  onActivateLiveChat, // NEW prop from App.jsx
}) => {
  const { isLoggedIn, accessToken, activeAvatar } = useAuth();

  const { messages, fetchMessages, messagesEndRef, inputMessage, sendMessage } =
    useMedia();

  useEffect(() => {
    if (activeAvatar && accessToken) {
      fetchMessages();
    }
  }, [activeAvatar?.avatar_id]);

  return (
    <div className="flex flex-row flex-grow bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
      {/* Main Chat Section */}
      <div className="flex flex-col flex-grow p-2 sm:p-4 relative">
        {/* Tabs */}
        {activeAvatar && (
          <div className="flex justify-center mb-2 border-b border-white/20 gap-4">
            <button
              className={`px-4 py-2 ${
                activeTab === 'chat'
                  ? 'border-b-2 border-white font-semibold'
                  : ''
              }`}
              onClick={() => setActiveTab('chat')}
            >
              {activeAvatar.name || 'Chat'}
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'documents'
                  ? 'border-b-2 border-white font-semibold'
                  : ''
              }`}
              onClick={() => setActiveTab('documents')}
            >
              Avatar Settings
            </button>
          </div>
        )}

        <LiveTranscriptionTicker isTranscribing={false} />
        <AudioStreamer isTranscribing={false} />

        {!activeAvatar && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20">
            <User className="w-32 h-32 text-gray-400" />
          </div>
        )}

        {activeAvatar && activeTab === 'chat' && (
          <div className="flex flex-col flex-grow p-2 sm:p-4 relative">
            <MessageList
              messages={messages[activeAvatar.avatar_id] || []}
              messagesEndRef={messagesEndRef}
            />

            <div className="flex items-center mt-2">
              <InputBar
                avatarId={activeAvatar.avatar_id}
                accessToken={accessToken}
                dropdownRef={dropdownRef}
                isLiveChatView={false} // or true if needed
                onActivateLiveChat={onActivateLiveChat} // pass function to trigger live chat
              />
            </div>
          </div>
        )}

        {activeAvatar && activeTab === 'documents' && (
          <div className="flex flex-col flex-grow p-2 sm:p-4 relative overflow-y-auto">
            <AvatarSettings
              avatarId={activeAvatar.avatar_id}
              accessToken={accessToken}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
