// components/InputBar.jsx
import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

const InputBar = ({ avatar_id, accessToken }) => {
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

  return (
    <div className="w-full px-4 py-3 bg-black/40 rounded-xl flex flex-col gap-2">
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

      {/* Input + Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="hover:scale-110 transition-transform"
        >
          <Upload className="text-white w-6 h-6" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileChange}
        />
        <input
          className="flex-grow min-w-0 rounded px-3 py-2 border border-gray-700 focus:outline focus:outline-2 focus:outline-cyan-400 text-white bg-black/35 from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 transform shadow-lg"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setSender('user');
              sendMessage(mediaFiles, () => {
                setMediaFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              });
            }
          }}
        />
        <button
          onClick={() => {
            setSender('user');
            sendMessage(mediaFiles, () => {
              setMediaFiles([]);
              if (fileInputRef.current) fileInputRef.current.value = '';
            });
          }}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InputBar;
