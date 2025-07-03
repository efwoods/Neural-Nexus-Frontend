// components/MediaContext.jsx
// This handles sending messages, thought-to-text, thought-to-image, and conversation suggestions.
// provides interfaces to the services that handle the actual fetch requests.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useNgrokApiUrl } from './NgrokAPIContext';
import { ThoughtToImageService } from '../services/ThoughtToImageService';
import { AudioInputService } from '../services/AudioInputService';
import { FileUploadService } from '../services/FileUploadService';
import { MessageService } from '../services/MessageService';
import { TranscriptionService } from '../services/TranscriptionService';
import { useAuth } from '../context/AuthContext';
const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const { ngrokHttpsUrl, ngrokWsUrl } = useNgrokApiUrl();
  const { accessToken, activeAvatar, user } = useAuth();
  console.log('MediaProvider Service call of ngrokHttpsUrl:', ngrokHttpsUrl);
  // variables
  const [isThoughtToImageEnabled, setIsThoughtToImageEnabled] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [sender, setSender] = useState('');
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

  // function interface
  const startThoughtToImage = async () => {
    if (!accessToken) return;
    console.log('startThoughtToImage');
    console.log('isThoughtToImageEnabled:' + isThoughtToImageEnabled);
    setIsThoughtToImageEnabled(true);
    //send post request
    try {
      console.log('user.user_id:', user.user_id);
      console.log('activeAvatar.avatar_id:', activeAvatar.avatar_id);
      const thoughtToImageSimulationResponse =
        await ThoughtToImageService.enableThoughtToImage(
          accessToken,
          user.user_id,
          activeAvatar.avatar_id,
          true
        );
      console.log(thoughtToImageSimulationResponse);
      //   setAvatars((prev) => prev.filter((a) => a.id !== avatarId));
      //   const delete_response = await AvatarService.deleteAvatar(
      //     accessToken,
      //     avatarId
      //   );
      //   console.log('Delete avatar response:', JSON.stringify(delete_response));
      //   if (delete_response !== true) throw new Error('Failed to delete avatar');
      //   // ✅ Refetch avatars to update UI
      //   await getAvatars(accessToken);
    } catch (error) {
      console.error('AuthContext: Delete avatar failed:', error);
    }
  };
  // function interface
  const stopThoughtToImage = () => {
    console.log('stopThoughtToImage');
    console.log('isThoughtToImageEnabled:' + isThoughtToImageEnabled);
    setIsThoughtToImageEnabled(false);
    console.log('user.user_id:', user.user_id);
    console.log('activeAvatar.avatar_id:', activeAvatar.avatar_id);
    const thoughtToImageSimulationResponse =
      ThoughtToImageService.enableThoughtToImage(
        accessToken,
        user.user_id,
        activeAvatar.avatar_id,
        false
      );
    console.log(thoughtToImageSimulationResponse);
    //send post request
    try {
      //   setAvatars((prev) => prev.filter((a) => a.id !== avatarId));
      //   const delete_response = await AvatarService.deleteAvatar(
      //     accessToken,
      //     avatarId
      //   );
      //   console.log('Delete avatar response:', JSON.stringify(delete_response));
      //   if (delete_response !== true) throw new Error('Failed to delete avatar');
      //   // ✅ Refetch avatars to update UI
      //   await getAvatars(accessToken);
    } catch (error) {
      console.error('AuthContext: Delete avatar failed:', error);
    }
  };

  async function sendMessage() {
    if (!activeAvatar || (!inputMessage.trim() && mediaFiles.length === 0))
      return;

    try {
      const formData = new FormData();
      formData.append('avatar_id', activeAvatar.avatar_id);
      if (inputMessage.trim()) formData.append('message', inputMessage.trim());

      formData.append('sender', sender);

      mediaFiles.forEach((file) => {
        formData.append('media', file); // backend expects media as list
      });

      const response = await fetch(
        `${getNgrokHttpsUrl()}/neural-nexus-db/avatars/post_message`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'ngrok-skip-browser-warning': '69420',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Message post failed: ${response.statusText}`);
      }

      const result = await response.json();

      const newMessage = {
        id: result.message_id || Date.now().toString(),
        content: inputMessage,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [activeAvatar.avatar_id]: [
          ...(prev[activeAvatar.avatar_id] || []),
          newMessage,
        ],
      }));
      setSender('');
      setInputMessage('');
      setMediaFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMessages();
    } catch (err) {
      console.error('sendMessage failed:', err.message);
    }
  }

  // On Avatar Selection or app load call fetch Messages
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
          sender:
            msg.sender ||
            (msg.type === 'text' && msg.from_avatar ? 'avatar' : 'user'), // fallback if backend lacks sender
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

    setAvatars((prev) =>
      prev.map((avatar) => {
        if (avatar.id === activeAvatar.id) {
          const newFiles = files.map((file) => ({
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          }));
          const isImage = (type) => type.startsWith('image/');
          const newDocuments = newFiles.filter((f) => !isImage(f.type));
          const newImages = newFiles.filter((f) => isImage(f.type));
          return {
            ...avatar,
            documents: [...avatar.documents, ...newDocuments],
            images: [...avatar.images, ...newImages],
          };
        }
        return avatar;
      })
    );

    const uploadMessage = {
      id: Date.now(),
      content: `Uploaded ${files.length} file(s): ${files
        .map((f) => f.name)
        .join(', ')}`,
      sender: sender,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeAvatar.avatar_id]: [
        ...(prev[activeAvatar.avatar_id] || []),
        uploadMessage,
      ],
    }));
    event.target.value = '';
    setSender('');
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
    const avatarResponse = {
      id: Date.now() + 1,
      content: `I received your voice message! As ${activeAvatar.name}, I would process your audio and respond accordingly. I have ${activeAvatar.documents.length} documents and ${activeAvatar.images.length} images in my knowledge base.`,
      sender: 'avatar',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      [activeAvatar.avatar_id]: [
        ...(prev[activeAvatar.avatar_id] || []),
        voiceMessage,
        avatarResponse,
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
        } else {
          console.warn('Empty or invalid transcript received:', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error, event.data);
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
    const base = getNgrokHttpsUrl(); // ex: https://<ngrok-id>.ngrok.io
    return `${base}/media/${media_id}?token=${accessToken}`;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
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
