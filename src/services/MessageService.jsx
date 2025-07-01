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

  const response = await fetch(
    `${getNgrokHttpsUrl()}/neural-nexus-db/avatars/post_message`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to save message');
  }

  return await response.json();
}

export async function getAvatarMessages(avatar_id, accessToken) {
  const response = await fetch(
    `${getNgrokHttpsUrl()}/neural-nexus-db/avatars/get_avatar_messages?avatar_id=${avatar_id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'ngrok-skip-browser-warning': '69420',
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

export const MessageService = {
  saveMessage,
  getAvatarMessages,
};
