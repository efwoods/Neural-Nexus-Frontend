// services/AvatarService.jsx
import { getNgrokHttpsUrl } from '../context/NgrokAPIStore';

export const AvatarService = {
  async getAll(accessToken) {
    try {
      const ngrokHttpsUrl = getNgrokHttpsUrl();
      console.log('Avatar Service call of dbHttpsUrl:', dbHttpsUrl);
      console.log(
        'Calling `${dbHttpsUrl}/avatars/get_all`, from Avatar Service'
      );
      const res = await fetch(`${dbHttpsUrl}/avatars/get_all`, {
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
      console.log('createAvatar payload:', payload);
      console.log('calling `${dbHttpsUrl}/avatars/create` from Avatar Service');
      const response = await fetch(`${dbHttpsUrl}/avatars/create`, {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());
      return await response.json(); // Returns the created avatar
    } catch (error) {
      console.error('Error creating avatar:', error);
      throw error;
    }
  },

  async deleteAvatar(accessToken, avatar_id) {
    console.log('Avatar_id: ' + avatar_id);
    try {
      const ngrokHttpsUrl = getNgrokHttpsUrl();
      console.log('calling `${dbHttpsUrl}/avatars/delete` from Avatar Service');
      const response = await fetch(`${dbHttpsUrl}/avatars/delete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({ avatar_id: avatar_id }),
      });
      let res = await response.json();
      console.log('AvatarService: Delete avatar response:', res);
      if (res.status !== 'success') throw new Error(await JSON.stringify(res));
      return true;
    } catch (error) {
      console.error('Avatar Service: Error deleting avatar:', error);
      throw error;
    }
  },
};
