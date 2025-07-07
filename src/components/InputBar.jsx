import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import DataExchangeDropdown from './DataExchangeDropdown';

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
  } = useMedia();

  const handleSendMessage = () => {
    setSender('user');
    sendMessage(mediaFiles, () => {
      setMediaFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  return (
    <div className="w-full px-4 py-3 bg-black/40 rounded-xl flex flex-col gap-3">
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

      {/* Row 2: Text Input Bar */}
      <div className="flex flex-row items-center gap-2 w-full">
        <input
          className="flex-grow min-w-0 rounded px-3 py-2 border border-gray-700 focus:outline focus:outline-2 focus:outline-cyan-400 text-white bg-black/35 placeholder-gray-400"
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
      {/* Row 1: Upload Images Button on Left */}

      {/* Row 3: Send Button */}

      {/* Row 3: Upload on Left, Dropdown + Send on Right */}
      <div className="flex flex-row items-center justify-between">
        {/* Left side: Upload Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="transition-transform duration-300 hover:scale-105 px-4 py-2 rounded hover:bg-cyan-600 transition-colors focus:outline focus:outline-2 focus:outline-cyan-400 min-w-0 rounded px-3 py-2 border border-gray-700 text-white bg-black/35 from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 px-6 py-3 rounded-xl flex font-semibold gap-2 transition-all duration-300 transform shadow-lg items-center justify-center max-h-64 overflow-y-auto"
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
        <div className="flex items-center gap-2">
          <DataExchangeDropdown
            showDataExchangeDropdown={showDataExchangeDropdown}
            setShowDataExchangeDropdown={setShowDataExchangeDropdown}
            dropdownRef={dropdownRef}
          />
          <button
            onClick={handleSendMessage}
            className="transition-transform duration-300 hover:scale-105 px-4 py-2 rounded hover:bg-cyan-600 transition-colors focus:outline focus:outline-2 focus:outline-cyan-400 min-w-0 rounded px-3 py-2 border border-gray-700 text-white bg-black/35 from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 px-6 py-3 rounded-xl flex font-semibold gap-2 transition-all duration-300 transform shadow-lg items-center justify-center max-h-64 overflow-y-auto"
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
