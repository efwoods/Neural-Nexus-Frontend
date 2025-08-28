// services/AvatarService.jsx
import { getDbHttpsUrl } from '../context/NgrokAPIStore';

export const AvatarService = {
  async getAll(accessToken) {
    try {
      const res = await fetch(`${getDbHttpsUrl()}/management/avatars/get_all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch avatars:', err);
      return [];
    }
  },

  async createAvatar(accessToken, payload) {
    try {
      const response = await fetch(
        `${getDbHttpsUrl()}/management/avatars/create`,
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
      return await response.json();
    } catch (error) {
      console.error('Error creating avatar:', error);
      throw error;
    }
  },

  async deleteAvatar(accessToken, avatar_id) {
    try {
      const response = await fetch(
        `${getDbHttpsUrl()}/management/avatars/delete`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: new URLSearchParams({ avatar_id }),
        }
      );
      const res = await response.json();
      if (res.status !== 'success') throw new Error(JSON.stringify(res));
      return res;
    } catch (error) {
      console.error('Avatar Service: Error deleting avatar:', error);
      throw error;
    }
  },

  async selectAvatar(accessToken, avatar_id) {
    try {
      const response = await fetch(
        `${getDbHttpsUrl()}/management/avatars/select_avatar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: new URLSearchParams({ avatar_id }),
        }
      );
      const res = await response.json();
      if (res.status !== 'success') throw new Error(JSON.stringify(res));
      return res;
    } catch (error) {
      console.error('Avatar Service: Error selecting avatar:', error);
      throw error;
    }
  },
};
