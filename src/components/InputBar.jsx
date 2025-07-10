//src/components/InputBar.jsx

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import DataExchangeDropdown from './DataExchangeDropdown';
import Dock from './Dock';

const InputBar = ({
  avatar_id,
  accessToken,
  setShowDataExchangeDropdown,
  showDataExchangeDropdown,
  dropdownRef,
}) => {
  const fileInputRef = useRef(null);
  const {
    sendMessage,
    inputMessage,
    setInputMessage,
    mediaFiles,
    setMediaFiles,
    handleFileChange,
    removeFile,
    sender,
    setSender,
    isTranscribing,
    startTranscription,
    stopTranscription,
    isThoughtToImageEnabled,
    startThoughtToImage,
    stopThoughtToImage,
    dataExchangeTypes,
  } = useMedia();

  const handleSendMessage = () => {
    setSender('user');
    sendMessage(mediaFiles, () => {
      setMediaFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  return (
    <div className="w-full rounded-xl flex flex-col">
      {/* Image Preview */}
      {mediaFiles.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {mediaFiles.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className="h-20 w-20 object-cover rounded border border-white"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-600 text-xs px-1 rounded-full"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preset Input Bar */}
      <div className="flex justify-center items-center gap-3 text-white">
        {[
          'Expand on that.',
          "Let's change the topic.",
          'How does that make you feel?',
        ].map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setInputMessage(preset)}
            title={preset}
            className="relative px-4 py-1 bg-gradient-to-r from-white/10 to-white/5 text-white font-semibold rounded-lg overflow-hidden group transition-all duration-300 text-sm"
          >
            <span className="relative z-10 truncate">{preset}</span>

            {/* Solid teal glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Moving white shimmer effect */}
            <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></div>
          </button>
        ))}
      </div>

      {/* Row 2: Text Input Bar */}
      <div className="flex flex-row items-center gap-2 w-full mb-1 mt-1">
        <input
          className="flex-grow min-w-0 rounded px-3 py-2 border border-gray-700 focus:outline focus:outline-2 focus:outline-teal-400 text-white bg-black/35 placeholder-gray-400"
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

      {/* Row 3: Upload on Left, Dropdown + Send on Right */}
      <div className="flex flex-row items-center justify-between">
        {/* Left side: Upload Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="transition-transform duration-300 hover:scale-105 px-4 py-2 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 min-w-0 rounded px-3 py-2 border border-gray-700 text-white bg-black/35 from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 px-6 py-3 rounded-xl flex font-semibold gap-2 transition-all duration-300 transform shadow-lg items-center justify-center max-h-64 overflow-y-auto"
            aria-label="Toggle data exchange options"
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

        {/* Right side: Dropdown + Send Button */}
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
        <div className="flex items-center gap-2 ">
          <button
            onClick={handleSendMessage}
            className="transition-transform duration-300 hover:scale-105 px-4 py-2 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 min-w-0 rounded px-3 py-2 border border-gray-700 text-white bg-black/35 from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 px-6 py-3 rounded-xl flex font-semibold gap-2 transition-all duration-300 transform shadow-lg items-center justify-center max-h-64 overflow-y-auto"
            aria-label="Toggle data exchange options"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
