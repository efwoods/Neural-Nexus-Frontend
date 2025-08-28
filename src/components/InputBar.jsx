import { useRef, useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { AudioLines } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import Dock from './Dock';
import { HiXMark } from 'react-icons/hi2';
import thoughtToImageService from '../services/ThoughtToImageService';

const InputBar = ({
  avatar_id,
  accessToken,
  setShowDataExchangeDropdown,
  showDataExchangeDropdown,
  dropdownRef,
  isLiveChatView = false, // NEW: prop to toggle live chat behavior
  onActivateLiveChat, // NEW: callback to trigger live chat
}) => {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [messageHistory, setMessageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempMessage, setTempMessage] = useState('');
  const [editingCaption, setEditingCaption] = useState(null);
  const [captions, setCaptions] = useState({});
  const [isHovered, setIsHovered] = useState(false);

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

  // Key handler
  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      navigateHistory('down');
    }
  };

  const navigateHistory = (direction) => {
    if (messageHistory.length === 0) return;
    if (direction === 'up') {
      if (historyIndex === -1) {
        setTempMessage(inputMessage);
        setHistoryIndex(messageHistory.length - 1);
        setInputMessage(messageHistory[messageHistory.length - 1]);
      } else if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setInputMessage(messageHistory[historyIndex - 1]);
      }
    } else if (direction === 'down') {
      if (historyIndex === messageHistory.length - 1) {
        setHistoryIndex(-1);
        setInputMessage(tempMessage);
        setTempMessage('');
      } else if (historyIndex > -1) {
        setHistoryIndex(historyIndex + 1);
        setInputMessage(messageHistory[historyIndex + 1]);
      }
    }
  };

  const handleInput = (e) => {
    setInputMessage(e.target.value);
    if (historyIndex !== -1) {
      setHistoryIndex(-1);
      setTempMessage('');
    }
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && mediaFiles.length === 0) {
      if (isLiveChatView && onActivateLiveChat) {
        onActivateLiveChat(); // Trigger live chat if input empty
      }
      return;
    }

    if (
      inputMessage.trim() &&
      (messageHistory.length === 0 ||
        messageHistory[messageHistory.length - 1] !== inputMessage.trim())
    ) {
      setMessageHistory((prev) => [...prev, inputMessage.trim()]);
    }

    setHistoryIndex(-1);
    setTempMessage('');
    setSender('user');
    sendMessage(mediaFiles, () => {
      setMediaFiles([]);
      setInputMessage('');
      setCaptions({});
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer?.files || []);
    handleFileChange({ target: { files } });
  };

  const handleRemoveFile = (index) => {
    removeFile(index);
    setCaptions((prev) => {
      const newCaptions = { ...prev };
      delete newCaptions[index];
      const reindexed = {};
      Object.keys(newCaptions).forEach((key) => {
        const keyIndex = parseInt(key);
        if (keyIndex > index) reindexed[keyIndex - 1] = newCaptions[key];
        else reindexed[key] = newCaptions[key];
      });
      return reindexed;
    });
  };

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [inputMessage]);

  useEffect(() => {
    thoughtToImageService.onReconstructedImage = ({ file }) => {
      setMediaFiles((prevFiles) => [...prevFiles, file]);
    };
    return () => {
      thoughtToImageService.onReconstructedImage = null;
    };
  }, [mediaFiles.length]);

  return (
    <div
      className="w-full max-w-3xl mx-auto rounded-xl flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFileSelect(e);
      }}
    >
      {/* Preset Buttons */}
      {/* <div className="flex justify-center items-center gap-3 text-white flex-wrap mb-2"> These need to be toasts and call an api endpoint with the conversation context, avatar context, and user context
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
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></div>
          </button>
        ))}
      </div> */}

      {/* Input + Media */}
      <div className="mb-2 relative border border-gray-700 rounded-lg bg-black/35 focus-within:border-teal-400 transition-colors">
        {mediaFiles.length > 0 && (
          <div className="p-3 border-b border-gray-700/50">
            <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-400">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative flex-shrink-0 group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="h-16 w-16 object-cover rounded-lg border border-gray-600 group-hover:border-teal-400 transition-colors"
                  />
                  <HiXMark
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-0 -right-1 bg-red-900 hover:bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center transition-colors z-20"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          rows={1}
          style={{ lineHeight: '1.5rem', maxHeight: '9rem' }}
          className="w-full resize-none overflow-y-auto max-h-40 px-4 py-3 text-white bg-transparent placeholder-gray-400 scrollbar-thin scrollbar-thumb-teal-400 focus:outline-none border-none"
          placeholder="Type your message... (Ctrl+↑↓ for history)"
          value={inputMessage}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />

        {historyIndex !== -1 && (
          <div className="absolute right-2 top-2 text-xs text-teal-400 bg-black/50 px-2 py-1 rounded">
            {messageHistory.length - historyIndex}/{messageHistory.length}
          </div>
        )}
      </div>

      {/* Upload + Dock + Dynamic Send */}
      <div className="flex flex-row items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="transition-transform duration-300 hover:scale-105 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-white bg-black/35 border border-gray-700 hover:border-teal-400"
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
            onChange={handleFileSelect}
          />
        </div>

        <div className="flex items-center gap-2">
          <Dock
            isTranscribing={isTranscribing}
            startTranscription={startTranscription}
            stopTranscription={stopTranscription}
            isThoughtToImageEnabled={isThoughtToImageEnabled}
            startThoughtToImage={startThoughtToImage}
            stopThoughtToImage={stopThoughtToImage}
            dataExchangeTypes={dataExchangeTypes}
          />
          <button
            onClick={() => {
              if (!inputMessage.trim() && mediaFiles.length === 0) {
                // Trigger Live Chat if empty
                if (onActivateLiveChat) onActivateLiveChat();
              } else {
                handleSendMessage();
              }
            }}
            className="transition-transform duration-300 hover:scale-105 px-6 py-3 rounded-xl text-white bg-black/35 border border-gray-700 hover:border-teal-400 flex items-center justify-center gap-2"
          >
            {inputMessage.trim().length > 0 ? (
              'Send'
            ) : (
              <>
                <AudioLines className="w-5 h-5" />
                {/* Live Chat */}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
