// services/AvatarService.jsx
import { NgrokUrlProvider } from '../context/NgrokAPIContext';
import { getNgrokHttpsUrl } from '../context/NgrokAPIStore';

export const AvatarService = {
  async getAll(accessToken) {
    try {
      const ngrokHttpsUrl = getNgrokHttpsUrl();
      console.log('Avatar Service call of ngrokHttpsUrl:', ngrokHttpsUrl);
      const res = await fetch(
        `${ngrokHttpsUrl}/neural-nexus-db/avatars/get_all`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'ngrok-skip-browser-warning': '69420',
          },
        }
      );

      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch avatars:', err);
      return [];
    }
  },

  async createAvatar(accessToken, payload) {
    try {
      console.log('createAvatar payload:', payload);
      const ngrokHttpsUrl = getNgrokHttpsUrl();
      const response = await fetch(
        `${ngrokHttpsUrl}/neural-nexus-db/avatars/create`,
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'ngrok-skip-browser-warning': '69420',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(await response.text());
      return await response.json(); // Returns the created avatar
    } catch (error) {
      console.error('Error creating avatar:', error);
      throw error;
    }
  },

  async deleteAvatar(accessToken, avatarId) {
    console.log('Avatar_id: ' + avatarId);
    try {
      const ngrokHttpsUrl = getNgrokHttpsUrl();
      const response = await fetch(
        `${ngrokHttpsUrl}/neural-nexus-db/avatars/${avatarId}/delete`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'ngrok-skip-browser-warning': '69420',
          },
        }
      );
      let res = response.status;
      console.log('AvatarService: Delete avatar response:', res);
      if (res !== 'success') throw new Error(await response.text());
      return true;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  },
};
