// services/ThoughtToImageService.jsx

import { getNgrokHttpsUrl } from '../context/NgrokAPIStore';

export const ThoughtToImageService = {
  /**
   * Enable thought-to-image simulation by calling the pipeline endpoint.
   *
   * @param {string} accessToken - The JWT token for authorization.
   * @param {string} userId - The user ID (part of session_id).
   * @param {string} avatarId - The avatar ID (part of session_id).
   * @returns {Promise<object>} - The response from the simulation API.
   */
  async enableThoughtToImage(accessToken, userId, avatarId) {
    try {
      if (!userId || !avatarId) {
        throw new Error('userId and avatarId are required');
      }

      const ngrokHttpsUrl = getNgrokHttpsUrl();
      if (!ngrokHttpsUrl) {
        throw new Error('Ngrok HTTPS URL is not available');
      }

      const simulationPayload = {
        session_id: `${userId}.${avatarId}`,
        enable_thought_to_image: true,
      };

      console.log('EnableThoughtToImage payload:', simulationPayload);

      const simulationResponse = await fetch(
        `${ngrokHttpsUrl}/webcam-to-websocket-simulation-api/test/full-pipeline`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'ngrok-skip-browser-warning': '69420',
          },
          body: JSON.stringify(simulationPayload),
        }
      );

      if (!simulationResponse.ok) {
        const errorText = await simulationResponse.text();
        throw new Error(`Simulation API error: ${errorText}`);
      }

      const simulationData = await simulationResponse.json();
      console.log('Simulation triggered:', simulationData);

      return simulationData;
    } catch (error) {
      console.error('ThoughtToImageService error:', error);
      throw error;
    }
  },
};
