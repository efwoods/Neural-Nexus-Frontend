// services/ThoughtToImageService.jsx

import {
  incrementPendingRequests,
  decrementPendingRequests,
  clearPendingRequests,
} from '../components/toastManager';

import { getNgrokHttpsUrl, getNgrokWsUrl } from '../context/NgrokAPIStore';
class ThoughtToImageService {
  constructor() {
    this.socket = null;
    this.pollingInterval = null;
    this.controller = new AbortController();
  }

  connectReconstructedImageWebSocket(user_id) {
    const wsUrl = getNgrokWsUrl();
    const frontendWsUrl = `${wsUrl}/thought-to-image-simulation-api/reconstruct/ws/frontend/${user_id}`;

    this.socket = new WebSocket(frontendWsUrl);

    this.socket.onopen = () => {
      console.info('[ThoughtToImage] Frontend WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (
          message.type === 'reconstructed_image' &&
          message.status === 'success'
        ) {
          console.info('[ThoughtToImage] Received reconstructed image');

          if (message.image_data) {
            const imageUrl = `data:image/png;base64,${message.image_data}`;

            // Create a File object from the base64 data
            const byteCharacters = atob(message.image_data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            const file = new File([blob], 'reconstructed_image.png', {
              type: 'image/png',
            });

            // Notify consumers (e.g., InputBar)
            this.onReconstructedImage?.({
              file,
              imageUrl,
              metadata: message.metadata,
            });
            console.log('decrementPendingRequests();');
            decrementPendingRequests();
          }
        }
      } catch (err) {
        console.error('[ThoughtToImage] Error parsing frontend message', err);
      }
    };

    this.socket.onerror = (err) => {
      console.error('[ThoughtToImage] Frontend WebSocket error:', err);
    };

    this.socket.onclose = () => {
      console.warn('[ThoughtToImage] Frontend WebSocket closed');
    };
  }

  startPolling({ accessToken, avatar_id, user_id, pollingFreq }) {
    const ngrokUrl = getNgrokHttpsUrl();
    const endpoint = `${ngrokUrl}/thought-to-image-simulation-api/initialize/enable-thought-to-image`;
    console.log('starting polling');
    console.log('incrementPendingRequests();');
    // incrementPendingRequests();
    this.pollingInterval = setInterval(async () => {
      try {
        console.log('incrementPendingRequests();');
        incrementPendingRequests();
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
    clearPendingRequests();
  }
}

const thoughtToImageService = new ThoughtToImageService();
export default thoughtToImageService;
