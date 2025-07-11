import { useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import Dock from './Dock';

const InputBar = ({
  avatar_id,
  accessToken,
  setShowDataExchangeDropdown,
  showDataExchangeDropdown,
  dropdownRef,
}) => {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null); // new ref for textarea

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

  // Send message on Enter (without Shift)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      handleSendMessage();
    }
    // else let default behavior (including Shift+Enter newline) happen
  };

  // Auto resize textarea height to fit content
  const handleInput = (e) => {
    setInputMessage(e.target.value);

    // Reset height to auto then set to scrollHeight for shrink/grow
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto'; // reset height to shrink if needed
      ta.style.height = ta.scrollHeight + 'px'; // grow to fit content
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && mediaFiles.length === 0) return; // ignore empty sends

    setSender('user');
    sendMessage(mediaFiles, () => {
      setMediaFiles([]);
      setInputMessage(''); // clear input after send

      if (fileInputRef.current) fileInputRef.current.value = '';

      // Reset textarea height on clear
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    });
  };

  // Resize once on mount and when inputMessage changes (for external changes)
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [inputMessage]);

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl flex flex-col">
      {/* Image Preview Section */}
      {mediaFiles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-2 scrollbar-thin scrollbar-thumb-teal-400">
          {mediaFiles.map((file, index) => (
            <div key={index} className="relative flex-shrink-0">
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

      {/* Native textarea Input */}
      <div className="mb-2">
        <textarea
          ref={textareaRef}
          rows={1}
          style={{ lineHeight: '1.5rem', maxHeight: '9rem' }} // 6 * 1.5rem = 9rem max height
          className="w-full resize-none overflow-y-auto max-h-40 rounded px-3 py-2 border border-gray-700 focus:outline focus:outline-2 focus:outline-teal-400 text-white bg-black/35 placeholder-gray-400 scrollbar-thin scrollbar-thumb-teal-400 px-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-400"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </div>

      {/* Upload + Dock + Send */}
      <div className="flex flex-row items-center justify-between mt-1">
        {/* Upload */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="transition-transform duration-300 hover:scale-105 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-white bg-black/35 border border-gray-700"
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
            className="transition-transform duration-300 hover:scale-105 px-6 py-3 rounded-xl text-white bg-black/35 border border-gray-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
