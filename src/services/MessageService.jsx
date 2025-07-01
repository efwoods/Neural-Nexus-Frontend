// Updated MessageService.jsx

import { getNgrokHttpsUrl } from '../context/NgrokAPIStore';

export async function saveMessage(avatar_id, message, mediaFiles, accessToken) {
  const formData = new FormData();
  formData.append('avatar_id', avatar_id);
  if (message) formData.append('message', message);
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((file) => {
      formData.append('media', file);
    });
  }

  const response = await fetch(`${getNgrokHttpsUrl()}/avatars/post_message`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to save message');
  }

  return await response.json();
}

export async function getAvatarMessages(avatar_id, accessToken) {
  const response = await fetch(
    `${getNgrokHttpsUrl()}/avatars/get_avatar_messages?avatar_id=${avatar_id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch messages');
  }

  const data = await response.json();
  return data.messages;
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
        sender: msg.sender || 'user',
        timestamp: msg.timestamp,
      })),
    }));
  } catch (error) {
    console.error('Failed to fetch messages:', error);
  }
};

export const MessageService = {
  saveMessage,
  getAvatarMessages,
  fetchMessages,
};
