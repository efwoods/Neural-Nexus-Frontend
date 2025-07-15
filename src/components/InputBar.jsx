import { useRef, useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
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
}) => {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  // Message history state
  const [messageHistory, setMessageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempMessage, setTempMessage] = useState(''); // Store current draft when navigating history
  // Image caption editing state
  const [editingCaption, setEditingCaption] = useState(null);
  const [captions, setCaptions] = useState({});

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

  // Enhanced key handler with history navigation
  const handleKeyDown = (e) => {
    // Stop event propagation to prevent App.jsx global handler from interfering
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Allow default behavior for Shift+Enter (newline)
      // Don't preventDefault() here - let the textarea handle it naturally
      return;
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      navigateHistory('down');
    }
    // Regular up/down arrows without modifiers will work normally in textarea
  };

  // History navigation logic
  const navigateHistory = (direction) => {
    if (messageHistory.length === 0) return;
    if (direction === 'up') {
      if (historyIndex === -1) {
        // First time navigating up - store current message
        setTempMessage(inputMessage);
        setHistoryIndex(messageHistory.length - 1);
        setInputMessage(messageHistory[messageHistory.length - 1]);
      } else if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setInputMessage(messageHistory[historyIndex - 1]);
      }
    } else if (direction === 'down') {
      if (historyIndex === messageHistory.length - 1) {
        // At newest entry - restore temp message
        setHistoryIndex(-1);
        setInputMessage(tempMessage);
        setTempMessage('');
      } else if (historyIndex > -1) {
        setHistoryIndex(historyIndex + 1);
        setInputMessage(messageHistory[historyIndex + 1]);
      }
    }
  };

  // Auto resize textarea height to fit content
  const handleInput = (e) => {
    setInputMessage(e.target.value);
    // Reset history navigation when user types
    if (historyIndex !== -1) {
      setHistoryIndex(-1);
      setTempMessage('');
    }
    // Resize textarea
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && mediaFiles.length === 0) return;
    // Add to history if not empty and not duplicate
    if (
      inputMessage.trim() &&
      (messageHistory.length === 0 ||
        messageHistory[messageHistory.length - 1] !== inputMessage.trim())
    ) {
      setMessageHistory((prev) => [...prev, inputMessage.trim()]);
    }
    // Reset history navigation
    setHistoryIndex(-1);
    setTempMessage('');
    setSender('user');
    sendMessage(mediaFiles, () => {
      setMediaFiles([]);
      setInputMessage('');
      setCaptions({}); // Clear captions when message is sent
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    });
  };

  // Enhanced file handler with drag and drop support
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer?.files || []);
    handleFileChange({ target: { files } });
  };

  // Enhanced remove file function
  const handleRemoveFile = (index) => {
    removeFile(index);
    // Remove caption for this file
    setCaptions((prev) => {
      const newCaptions = { ...prev };
      delete newCaptions[index];
      // Reindex remaining captions
      const reindexed = {};
      Object.keys(newCaptions).forEach((key) => {
        const keyIndex = parseInt(key);
        if (keyIndex > index) {
          reindexed[keyIndex - 1] = newCaptions[key];
        } else {
          reindexed[key] = newCaptions[key];
        }
      });
      return reindexed;
    });
  };

  // Caption editing functions
  const startEditingCaption = (index) => {
    setEditingCaption(index);
  };

  const updateCaption = (index, caption) => {
    setCaptions((prev) => ({
      ...prev,
      [index]: caption,
    }));
  };

  const finishEditingCaption = () => {
    setEditingCaption(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e);
  };

  // Resize on mount and input changes
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [inputMessage]);

  // Receive Thought to Image Previews of Reconstructed Images
  useEffect(() => {
    console.log('Reconstructed Image Received in the Frontend');
    thoughtToImageService.onReconstructedImage = ({
      file,
      imageUrl,
      metadata,
    }) => {
      console.info('[InputBar] Adding reconstructed image to mediaFiles');

      setMediaFiles((prevFiles) => [...prevFiles, file]);

      // Optional: set caption or metadata if needed
      // setCaptions((prevCaptions) => ({
      //   ...prevCaptions,
      //   [mediaFiles.length]: `Reconstructed on ${new Date().toLocaleString()}`,
      // }));
    };

    return () => {
      thoughtToImageService.onReconstructedImage = null;
    };
  }, [mediaFiles.length]);

  return (
    <div
      className="w-full max-w-3xl mx-auto rounded-xl flex flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Preset Buttons */}
      <div className="flex justify-center items-center gap-3 text-white flex-wrap mb-2">
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
      </div>

      {/* Integrated Input Container */}
      <div className="mb-2 relative border border-gray-700 rounded-lg bg-black/35 focus-within:border-teal-400 transition-colors">
        {/* Image thumbnails inside the input container */}
        {mediaFiles.length > 0 && (
          <div className="p-3 border-b border-gray-700/50">
            <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-400">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative flex-shrink-0 group">
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      className="h-16 w-16 object-cover rounded-lg border border-gray-600 group-hover:border-teal-400 transition-colors"
                    />
                    {/* Remove button */}

                    <HiXMark
                      onClick={() => handleRemoveFile(index)}
                      className="absolute -top-0 -right-1 bg-red-900 hover:bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center transition-colors z-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Textarea */}
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

        {/* History indicator */}
        {historyIndex !== -1 && (
          <div className="absolute right-2 top-2 text-xs text-teal-400 bg-black/50 px-2 py-1 rounded">
            {messageHistory.length - historyIndex}/{messageHistory.length}
          </div>
        )}
      </div>

      {/* Upload + Dock + Send */}
      <div className="flex flex-row items-center justify-between mt-1">
        {/* Upload */}
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

        {/* Dock + Send */}
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
            onClick={handleSendMessage}
            className="transition-transform duration-300 hover:scale-105 px-6 py-3 rounded-xl text-white bg-black/35 border border-gray-700 hover:border-teal-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
