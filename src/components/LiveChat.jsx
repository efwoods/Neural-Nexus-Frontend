// /src/components/LiveChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@mui/material';
import { User } from 'lucide-react';

const LiveChat = ({ avatarIcon, onEndLiveChat, onSendVoice }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [toasts, setToasts] = useState([]);
  const mediaRecorderRef = useRef(null);

  // Add a toast message
  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000); // disappear after 3s
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();
    setIsRecording(true);

    mediaRecorderRef.current.ondataavailable = (event) => {
      onSendVoice(event.data);

      // Example: simulate avatar response after sending voice
      addToast('Avatar is thinking...');
      setTimeout(() => {
        addToast('Hello, this is the avatar speaking!');
        setIsAvatarSpeaking(true);
        setTimeout(() => setIsAvatarSpeaking(false), 2000);
      }, 1000);
    };

    mediaRecorderRef.current.onstop = () => {
      setIsRecording(false);
    };
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // Push-to-talk using spacebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') startRecording();
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') stopRecording();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      {/* Toast container */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="px-4 py-2 bg-black text-white/70 rounded-lg shadow-lg animate-slide-down"
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div
        className={`flex flex-col items-center justify-center h-full w-full transition-all ${
          isRecording
            ? 'border-4 border-blue-500 animate-pulse rounded-2xl'
            : ''
        }`}
      >
        <div className="flex items-center justify-center">
          {avatarIcon ? (
            <img
              src={avatarIcon}
              alt="Avatar"
              className={`rounded-2xl aspect-[9/16] border-4 transition-all ${
                isAvatarSpeaking
                  ? 'border-green-500 animate-pulse'
                  : 'border-transparent'
              }`}
            />
          ) : (
            <User className="w-32 h-32 text-gray-400" />
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            variant="contained"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
          >
            Speak
          </Button>
          <Button variant="outlined" onClick={onEndLiveChat}>
            End
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
