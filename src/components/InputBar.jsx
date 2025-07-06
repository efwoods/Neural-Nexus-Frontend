import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import DataExchangeDropdown from './DataExchangeDropdown';

const InputBar = ({
  avatar_id,
  accessToken,
  showDataExchangeDropdown,
  setShowDataExchangeDropdown,
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

  return (
    <div className="w-full px-4 py-3 bg-black/40 rounded-xl flex flex-col gap-3">
      {/* Row 1: Image Previews */}
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

      {/* Row 2: Controls (Dropdown + Upload Button) */}
      <div className="flex flex-row items-center gap-2 justify-end">
        <DataExchangeDropdown
          showDataExchangeDropdown={showDataExchangeDropdown}
          setShowDataExchangeDropdown={setShowDataExchangeDropdown}
          dropdownRef={dropdownRef}
        />
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
      </div>

      {/* Row 3: Input and Send */}
      <div className="flex flex-row items-center gap-2 w-full">
        <input
          className="flex-grow min-w-0 rounded-xl px-6 py-3 border border-gray-700 focus:outline focus:outline-2 focus:outline-cyan-400 text-white bg-black/35 font-semibold transition-all duration-300 shadow-lg"
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
