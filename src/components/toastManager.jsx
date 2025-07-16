// src/utils/toastManager.js
import toast from 'react-hot-toast';

let toastId = null;
let pendingCount = 0;

export const incrementPendingRequests = () => {
  pendingCount += 1;

  if (pendingCount === 1) {
    toastId = toast.loading(`Simulating image (1 pending)...`, {
      duration: Infinity,
    });
  } else if (toastId) {
    toast.loading(`Reconstructing Image (${pendingCount} pending)...`, {
      id: toastId,
      duration: Infinity,
    });
  }
};

export const decrementPendingRequests = () => {
  pendingCount = Math.max(0, pendingCount - 1);
  toast.success('Image Reconstructed!');
  if (pendingCount === 0 && toastId) {
    toast.dismiss(toastId);
    toastId = null;
  } else if (toastId) {
    toast.loading(
      `Reconstructing image from Neural Waveform (${pendingCount} pending)...`,
      {
        id: toastId,
        duration: Infinity,
      }
    );
  }
};

export const clearPendingRequests = () => {
  pendingCount = 0;
  toast.dismiss(toastId);
  toastId = null;
};

export const getPendingCount = () => pendingCount;
