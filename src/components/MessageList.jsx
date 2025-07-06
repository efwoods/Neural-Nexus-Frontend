// components/MessageList.jsx

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNgrokHttpsUrl } from '../context/NgrokAPIStore';
import { useMedia } from '../context/MediaContext';

const MessageList = ({ messages, messagesEndRef }) => {
  const { accessToken } = useAuth();
  const { getMediaUrl } = useMedia();
  const ngrokHttpsUrl = getNgrokHttpsUrl();
  useEffect(() => {
    console.log(ngrokHttpsUrl);
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesEndRef]);

  return (
    <div className="flex-grow overflow-y-auto mb-4 space-y-2 px-2 flex flex-col">
      {messages.map((msg) => (
        <div
          key={msg._id || msg.id}
          className={`max-w-[70%] p-2 rounded-lg break-words ${
            msg.sender === 'user'
              ? 'bg-cyan-600 self-end text-white'
              : msg.sender === 'avatar'
              ? 'bg-gray-700 self-start text-white'
              : 'bg-gray-600 self-center italic text-gray-300'
          }`}
        >
          {/* TEXT CONTENT */}
          {msg.content && (
            <div className="whitespace-pre-wrap">{msg.content}</div>
          )}

          {/* MEDIA CONTENT */}
          {msg.media &&
            Array.isArray(msg.media) &&
            msg.media.map((media) => (
              <div key={media.media_id} className="mt-2">
                {media.content_type.startsWith('image/') ? (
                  <img
                    src={`${getNgrokHttpsUrl()}/neural-nexus-db/media/${
                      media.media_id
                    }?token=${accessToken}`}
                    alt={media.filename}
                  />
                ) : media.content_type.startsWith('audio/') ? (
                  <audio
                    controls
                    src={`${getNgrokHttpsUrl()}/neural-nexus-db/media/${
                      media.media_id
                    }?token=${accessToken}`}
                  />
                ) : media.content_type.startsWith('video/') ? (
                  <video
                    controls
                    className="max-w-full max-h-64"
                    src={`${getNgrokHttpsUrl()}/neural-nexus-db/media/${
                      media.media_id
                    }?token=${accessToken}`}
                  />
                ) : (
                  <a
                    href={`${getNgrokHttpsUrl()}/neural-nexus-db/media/${
                      media.media_id
                    }?token=${accessToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-300"
                  >
                    {media.filename || 'Download file'}
                  </a>
                )}
              </div>
            ))}

          {/* TIMESTAMP */}
          <div className="text-xs text-gray-400 mt-1 text-right select-none">
            {msg.timestamp &&
              new Date(msg.timestamp).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
