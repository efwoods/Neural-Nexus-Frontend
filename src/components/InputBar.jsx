//components/InputBar.jsx

import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import DataExchangeDropdown from './DataExchangeDropdown';
import Dock from './Dock';

import { Ear, EarOff, Eye, Send } from 'lucide-react';

const InputBar = ({ avatarId, accessToken }) => {
  const fileInputRef = useRef(null);
  const [inputMessage, setInputMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThoughtToImageEnabled, setIsThoughtToImageEnabled] = useState(false);

  const dataExchangeTypes = {
    voice: true,
    neuralImage: true,
  };

  const startTranscription = () => {
    setIsTranscribing(true);
    console.log('Starting transcription');
  };

  const stopTranscription = () => {
    setIsTranscribing(false);
    console.log('Stopping transcription');
  };

  const startThoughtToImage = () => {
    setIsThoughtToImageEnabled(true);
    console.log('Starting thought-to-image');
  };

  const stopThoughtToImage = () => {
    setIsThoughtToImageEnabled(false);
    console.log('Stopping thought-to-image');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && mediaFiles.length === 0) return;

    console.log('Sending message:', inputMessage, 'Files:', mediaFiles);
    setMediaFiles([]);
    setInputMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      {/* Input Container */}
      <div
        className="w-full py-3 bg-black/40 backdrop-blur-lg rounded-xl 
                      border border-white/20 shadow-2xl flex flex-col gap-3"
      >
        {/* Image Preview */}
        {mediaFiles.length > 0 && (
          <div className="px-4">
            <div className="flex gap-2 flex-wrap">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="h-20 w-20 object-cover rounded-lg border-2 border-white/20"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 
                               text-white text-xs w-6 h-6 rounded-full flex items-center justify-center
                               transition-colors duration-200 shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Row */}
        <div className="flex flex-row items-center gap-3 px-4">
          <input
            className="flex-grow min-w-0 rounded-xl px-4 py-3 
                       border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 
                       text-white bg-black/20 placeholder-gray-400 backdrop-blur-sm
                       transition-all duration-200"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-row items-center justify-between px-4">
          {/* Left side: Upload Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-black/40 border border-white/20 text-white
                         hover:bg-black/60 hover:border-white/40 hover:scale-105
                         transition-all duration-300 backdrop-blur-sm"
              aria-label="Upload files"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileChange}
            />
          </div>

          {/* Dock */}
          <Dock
            isTranscribing={isTranscribing}
            startTranscription={startTranscription}
            stopTranscription={stopTranscription}
            isThoughtToImageEnabled={isThoughtToImageEnabled}
            startThoughtToImage={startThoughtToImage}
            stopThoughtToImage={stopThoughtToImage}
            dataExchangeTypes={dataExchangeTypes}
          />

          {/* Right side: Send Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() && mediaFiles.length === 0}
              className="text-sm px-2 sm:px-4 py-1 sm:py-2 transition-transform duration-300 hover:scale-105 rounded hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700 text-white bg-black/35 font-semibold shadow-lg flex items-center justify-center gap-2 hover:scale-105"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
