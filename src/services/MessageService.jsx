// services/MessageService.jsx
import { getDbHttpsUrl } from '../context/NgrokAPIStore';

export async function saveMessage(
  avatar_id,
  message,
  mediaFiles,
  accessToken,
  sender
) {
  const formData = new FormData();
  formData.append('avatar_id', avatar_id);
  if (message) formData.append('message', message);
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((file) => {
      formData.append('media', file);
    });
  }
  formData.append('sender', sender);

  const response = await fetch(
    `${getDbHttpsUrl()}/documents/avatars/post_message`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
    `${getDbHttpsUrl()}/documents/avatars/get_avatar_messages?avatar_id=${avatar_id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
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
