// services/ThoughtToImageService.jsx

import { getNgrokHttpsUrl, getNgrokWsUrl } from '../context/NgrokAPIStore';

class ThoughtToImageService {
  constructor() {
    this.socket = null;
    this.pollingInterval = null;
    this.controller = new AbortController();
  }

  connectWebSocket({ accessToken, avatar_id, user_id, onReconstructed }) {
    const wsUrl = getNgrokWsUrl();
    const fullReconstructWsUrl = `${wsUrl}/thought-to-image-simulation-api/reconstruct/ws/reconstruct-image-from-waveform-latent`;

    this.socket = new WebSocket(fullReconstructWsUrl);

    this.socket.onopen = () => {
      console.info('[ThoughtToImage] WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.status === 'success') {
          console.info('[ThoughtToImage] Image reconstructed and uploaded');
          onReconstructed();
        }
      } catch (err) {
        console.error('[ThoughtToImage] Error parsing message', err);
      }
    };

    this.socket.onerror = (err) => {
      console.error('[ThoughtToImage] WebSocket error:', err);
    };

    this.socket.onclose = () => {
      console.warn('[ThoughtToImage] WebSocket closed');
    };
  }

  startPolling({ accessToken, avatar_id, user_id, pollingFreq }) {
    const ngrokUrl = getNgrokHttpsUrl();
    const endpoint = `${ngrokUrl}/thought-to-image-simulation-api/initialize/enable-thought-to-image`;

    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420',
          },
          body: JSON.stringify({
            user_id,
            avatar_id,
          }),
          signal: this.controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[ThoughtToImage] Error polling:', errorText);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[ThoughtToImage] Polling failed:', err);
        }
      }
    }, pollingFreq); // every 10 seconds
  }

  stopPolling() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = null;
    this.controller.abort();
    this.controller = new AbortController();
  }

  disconnectWebSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  cleanup() {
    this.stopPolling();
    this.disconnectWebSocket();
  }
}

const thoughtToImageService = new ThoughtToImageService();
export default thoughtToImageService;
