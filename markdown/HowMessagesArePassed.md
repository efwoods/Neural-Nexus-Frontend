

1) An avatar is selected:
2) ChatArea:
  useEffect(() => {
    // Now, anytime a user selects an avatar in Sidebar.jsx, the activeAvatar changes, and the ChatArea will auto-fetch messages from:
    //   Redis if cached
    //   MongoDB if not cached

    fetchMessages();
  }, [activeAvatar, accessToken]);

3) Media Context:
  // On Avatar Selection or app load call fetch Messages
  const fetchMessages = async () => {
    if (!activeAvatar || !accessToken) return;
    try {
      const fetched = await MessageService.getAvatarMessages(
        activeAvatar.avatar_id,
        accessToken
      );
      setMessages((prev) => ({
        ...prev,
        [activeAvatar.avatar_id]: fetched.map((msg) => ({
          id: msg._id,
          content: msg.message,
          media: msg.media || [],
          sender:
            msg.sender ||
            (msg.type === 'text' && msg.from_avatar ? 'avatar' : 'user'), // fallback if backend lacks sender
          timestamp: msg.timestamp,
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

4) MessageService:

export async function getAvatarMessages(avatar_id, accessToken) {
  const response = await fetch(
    `${getNgrokHttpsUrl()}/neural-nexus-db/avatars/get_avatar_messages?avatar_id=${avatar_id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'ngrok-skip-browser-warning': '69420',
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

5) call of https://a508-107-133-25-154.ngrok-free.app/neural-nexus-db/avatars/get_avatar_messages?avatar_id=8b461dc2-04a9-4c41-b861-690140474b6e

6) 

@router.get(
    "/avatars/get_avatar_messages",
    summary="Get all messages for an avatar (with caching in Redis)",
)
async def get_avatar_messages(
    avatar_id: UUID,
    current_user=Depends(get_current_user),
):
    redis_client = await get_redis_client()
    user_id = str(current_user["user_id"])
    redis_key = f"chat:{user_id}:{avatar_id}:full_messages"

    cached = await redis_client.get(redis_key)
    messages = []

    if cached:
        try:
            loaded = json.loads(cached)
            if loaded:
                messages = loaded
        except json.JSONDecodeError:
            pass

    if not messages:
        mongo_db = db.mongo_db
        conversation_collection = mongo_db["avatar_conversations"]
        media_collection = mongo_db["media"]

        avatar_id_str = str(avatar_id)
        user_id_str = str(current_user["user_id"])

        # Fetch all messages for avatar and user, sorted by timestamp ascending
        conv_filter = {"avatar_id": avatar_id_str, "user_id": user_id_str}
        cursor = conversation_collection.find(conv_filter).sort("timestamp", 1)
        raw_conversations = await cursor.to_list(length=1000)

        messages = []
        media_id_set = set()

        for msg in raw_conversations:
            msg["_id"] = str(msg["_id"])
            msg["timestamp"] = (
                msg["timestamp"].isoformat()
                if isinstance(msg["timestamp"], datetime)
                else msg["timestamp"]
            )
            media_list = []

            media_file_ids = msg.get("media_file_ids", [])
            if media_file_ids:
                # Query media documents for the media_file_ids
                media_docs = await media_collection.find(
                    {"_id": {"$in": [ObjectId(mid) for mid in media_file_ids]}}
                ).to_list(length=100)

                for media_doc in media_docs:
                    mid_str = str(media_doc["_id"])
                    media_id_set.add(mid_str)
                    media_list.append(
                        {
                            "media_id": mid_str,
                            "filename": media_doc.get("filename"),
                            "content_type": media_doc.get("content_type"),
                        }
                    )

            messages.append(
                {
                    "type": msg.get("type", "text"),
                    "message": msg.get("message", ""),
                    "timestamp": msg["timestamp"],
                    "media": media_list,
                    "_id": msg["_id"],
                }
            )

        # Now find media-only messages not referenced by conversation messages
        media_only_filter = {
            "avatar_id": avatar_id_str,
            "user_id": user_id_str,
            "_id": {"$nin": [ObjectId(mid) for mid in media_id_set]},
        }
        media_only_cursor = media_collection.find(media_only_filter).sort(
            "timestamp", 1
        )
        raw_media_only = await media_only_cursor.to_list(length=1000)

        for media_doc in raw_media_only:
            timestamp_val = (
                media_doc["timestamp"].isoformat()
                if isinstance(media_doc["timestamp"], datetime)
                else media_doc["timestamp"]
            )
            messages.append(
                {
                    "type": "media",
                    "message": "",
                    "timestamp": timestamp_val,
                    "media": [
                        {
                            "media_id": str(media_doc["_id"]),
                            "filename": media_doc.get("filename"),
                            "content_type": media_doc.get("content_type"),
                        }
                    ],
                    "_id": str(media_doc["_id"]),
                }
            )

        # Sort all messages by timestamp ascending
        messages.sort(key=lambda x: x["timestamp"])

        # Cache result in Redis for 1 hour
        logger.info(
            f"[CACHE WRITE] Writing {len(messages)} messages to Redis: {redis_key}"
        )
        await redis_client.set(
            redis_key, json.dumps(messages), ex=MESSAGE_CACHE_TTL_SECONDS
        )

    return {"avatar_id": str(avatar_id), "messages": messages}

On a cache miss, mongodb will load the messages and then the messages will be cached in redis. Messages are returned from cache or from db. to the frontend.

8) Messages are set:
setMessages((prev) => ({
        ...prev,
        [activeAvatar.avatar_id]: fetched.map((msg) => ({
          id: msg._id,
          content: msg.message,
          media: msg.media || [],
          sender:
            msg.sender ||
            (msg.type === 'text' && msg.from_avatar ? 'avatar' : 'user'), // fallback if backend lacks sender
          timestamp: msg.timestamp,
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }

9) Messages are passed as a property from the ChatArea upon set and presented in the message list:
// compontents/ChatArea.jsx:
  <MessageList
            messages={messages[activeAvatar.id] || []}
            messagesEndRef={messagesEndRef}
          />

10) Message List:
// components/MessageList.jsx

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNgrokHttpsUrl } from '../context/NgrokAPIStore';
import { useMedia } from '../context/MediaContext';

const MessageList = ({ messages, messagesEndRef }) => {
  const { accessToken } = useAuth();
  const { getMediaUrl } = useMedia();

  useEffect(() => {
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
              ? 'bg-teal-600 self-end text-white'
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
                    src={getMediaUrl(media.media_id, accessToken)}
                    alt={media.filename}
                    className="rounded max-h-48"
                  />
                ) : media.content_type.startsWith('audio/') ? (
                  <audio
                    controls
                    src={getMediaUrl(media.media_id, accessToken)}
                  />
                ) : media.content_type.startsWith('video/') ? (
                  <video
                    controls
                    className="max-w-full max-h-64"
                    src={getMediaUrl(media.media_id, accessToken)}
                  />
                ) : (
                  <a
                    href={getMediaUrl(media.media_id, accessToken)}
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