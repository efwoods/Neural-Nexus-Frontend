// src/context/MediaContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useNgrokApiUrl } from './NgrokAPIContext';
import { MessageService } from '../services/MessageService';
import { useAuth } from './AuthContext';

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const { ngrokHttpsUrl, ngrokWsUrl, dbHttpsUrl } = useNgrokApiUrl();
  const { accessToken, activeAvatar, user } = useAuth();
  const [isThoughtToImageEnabled, setIsThoughtToImageEnabled] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [sender, setSender] = useState('user');
  const [mediaFiles, setMediaFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);
  const MAX_FILE_SIZE_MB = 1 * 1024 * 1024;

  const [dataExchangeTypes, setDataExchangeTypes] = useState({
    text: true,
    voice: true,
    fileUpload: true,
    custom: true,
    neuralText: true,
    neuralImage: true,
    neuralMotion: true,
    blueToothControl: true,
    telepathy: true,
  });

  const startThoughtToImage = async () => {
    if (!accessToken || !user?.enable_grok_imagine) return;
    setIsThoughtToImageEnabled(true);
  };

  const stopThoughtToImage = () => {
    setIsThoughtToImageEnabled(false);
  };

  async function sendMessage() {
    if (!activeAvatar || (!inputMessage.trim() && mediaFiles.length === 0))
      return;

    try {
      const response = await MessageService.saveMessage(
        activeAvatar.avatar_id,
        inputMessage,
        mediaFiles,
        accessToken,
        sender
      );

      if (!response || response.status !== 'success') {
        throw new Error(response?.detail || 'Message post failed');
      }

      const newMessage = {
        id: response.user_message_id,
        content: inputMessage,
        sender: sender,
        timestamp: new Date().toISOString(),
        media:
          response.media_items > 0
            ? mediaFiles.map((f) => ({
                filename: f.name,
                content_type: f.type,
                url: response.media_items[0]?.url,
              }))
            : [],
      };

      if (response.ai_response) {
        const aiMessage = {
          id: response.ai_message_id,
          content: response.ai_response,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          media: [],
        };
        setMessages((prev) => ({
          ...prev,
          [activeAvatar.avatar_id]: [
            ...(prev[activeAvatar.avatar_id] || []),
            newMessage,
            aiMessage,
          ],
        }));
      } else {
        setMessages((prev) => ({
          ...prev,
          [activeAvatar.avatar_id]: [
            ...(prev[activeAvatar.avatar_id] || []),
            newMessage,
          ],
        }));
      }

      setInputMessage('');
      setMediaFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMessages();
    } catch (err) {
      if (err.status === 413) {
        alert(`One or more files exceed the maximum upload size of 1 MB.`);
      } else {
        alert(err.message || 'Failed to send message');
      }
    }
  }

  const fetchMessages = async () => {
    if (!activeAvatar || !accessToken) return;
    try {
      const fetched = await MessageService.getAvatarMessages(
        activeAvatar.avatar_id,
        accessToken
      );
      setMessages((prev) => ({
        ...prev,
        [activeAvatar.avatar_id]: fetched.map((msg) => ({
          id: msg._id,
          content: msg.message,
          media: msg.media || [],
          sender: msg.sender,
          timestamp: msg.timestamp,
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleFileUpload = (event) => {
    if (!activeAvatar || !dataExchangeTypes.fileUpload) return;
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => f.size <= MAX_FILE_SIZE_MB);
    if (validFiles.length < files.length) {
      alert('Some files exceed the 1 MB limit and were ignored.');
    }

    setMediaFiles((prev) => [...prev, ...validFiles]);
    event.target.value = '';
  };

  const startRecording = async () => {
    if (!dataExchangeTypes.voice) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        handleVoiceMessage(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsTranscribing(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isTranscribing) {
      mediaRecorderRef.current.stop();
      setIsTranscribing(false);
    }
  };

  const handleVoiceMessage = (audioBlob) => {
    if (!activeAvatar || !dataExchangeTypes.voice) return;
    const voiceMessage = {
      id: Date.now(),
      content: '[Voice Message]',
      sender: 'user',
      timestamp: new Date().toISOString(),
      isVoice: true,
      audioBlob,
    };
    setMessages((prev) => ({
      ...prev,
      [activeAvatar.avatar_id]: [
        ...(prev[activeAvatar.avatar_id] || []),
        voiceMessage,
      ],
    }));
  };

  const startTranscription = async () => {
    if (!dataExchangeTypes.voice) return;
    const wsUrl = ngrokWsUrl + '/transcription-api/transcribe/ws';
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = async () => {
      console.log('WebSocket connection opened');
      setIsTranscribing(true);
      audioContextRef.current = new AudioContext();
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current
      );
      processorRef.current = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );

      processorRef.current.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const downsampled = downsampleBuffer(
          input,
          audioContextRef.current.sampleRate,
          16000
        );
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(downsampled);
        }
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const text = data.transcript;
        if (typeof text === 'string' && text.trim() !== '') {
          document.dispatchEvent(
            new CustomEvent('transcription', { detail: text })
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (err) => console.error('WebSocket error:', err);
    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsTranscribing(false);
    };
  };

  const stopTranscription = () => {
    setIsTranscribing(false);
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (wsRef.current) wsRef.current.close();
  };

  function downsampleBuffer(buffer, inputSampleRate, outputSampleRate) {
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const sample = buffer[Math.floor(i * sampleRateRatio)];
      result[i] = Math.max(-32768, Math.min(32767, sample * 0x7fff));
    }
    return result;
  }

  const toggleDataExchangeType = (type) => {
    setDataExchangeTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
    if (type === 'voice' && !dataExchangeTypes.voice && isTranscribing) {
      stopTranscription();
      stopRecording();
    }
    if (
      type === 'neuralImage' &&
      !dataExchangeTypes.neuralImage &&
      isThoughtToImageEnabled
    ) {
      stopThoughtToImage();
      startThoughtToImage();
    }
  };

  const getMediaUrl = (media_id, accessToken) => {
    return `${dbHttpsUrl}/media/${media_id}?token=${accessToken}`;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(
      (f) => f.size <= MAX_FILE_SIZE_MB
    );
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <MediaContext.Provider
      value={{
        messages,
        setMessages,
        fetchMessages,
        messagesEndRef,
        inputMessage,
        setInputMessage,
        sendMessage,
        isThoughtToImageEnabled,
        startThoughtToImage,
        stopThoughtToImage,
        isTranscribing,
        startTranscription,
        stopTranscription,
        dataExchangeTypes,
        toggleDataExchangeType,
        fileInputRef,
        handleFileUpload,
        getMediaUrl,
        mediaFiles,
        setMediaFiles,
        handleFileChange,
        removeFile,
        sender,
        setSender,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
