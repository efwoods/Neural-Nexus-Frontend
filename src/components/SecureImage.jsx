import { useEffect, useState } from 'react';
import { getNgrokHttpsUrl } from '../context/NgrokAPIStore';

const SecureImage = ({ mediaId, filename, accessToken }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const fetchImage = async () => {
      try {
        const res = await fetch(
          `${getNgrokHttpsUrl()}/neural-nexus-db/media/${mediaId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'ngrok-skip-browser-warning': '69420',
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${res.status}`);
        }

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (isMounted) setImageSrc(objectUrl);
      } catch (err) {
        console.error('Secure image load failed:', err);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId, accessToken]);

  if (!imageSrc)
    return <div className="text-xs text-gray-400 italic">Loading image...</div>;

  return (
    <img
      src={imageSrc}
      alt={filename}
      className="max-w-full max-h-64 object-contain rounded border border-white"
    />
  );
};

export default SecureImage;
