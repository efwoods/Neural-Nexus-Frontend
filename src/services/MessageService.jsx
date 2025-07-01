// services/MessageService.jsx

import { getNgrokHttpsUrl } from '../context/NgrokAPIStore';
// services/MessageService.js

import { MongoClient } from 'mongodb';
import Redis from 'ioredis';

// ———————————————
// 1) Configuration
// ———————————————
const MONGO_URI = import.meta.env.VITE_MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB = import.meta.env.VITE_MONGO_DB || 'chat_app';
const REDIS_URI = import.meta.env.VITE_REDIS_URI || 'redis://127.0.0.1:6379';
const REDIS_LIST_PREFIX = 'chat_history:';
const CACHE_LIMIT = 50; // Keep last 50 messages per avatar

// ———————————————
// 2) Clients
// ———————————————
let mongoClient;
let messagesCollection;
const redis = new Redis(REDIS_URI);

// ———————————————
// 3) Initialize MongoDB
// ———————————————
async function initDatabase() {
  mongoClient = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
  await mongoClient.connect();
  const db = mongoClient.db(MONGO_DB);
  messagesCollection = db.collection('messages');
  await messagesCollection.createIndex({ avatarId: 1, date: -1 });
  console.log('✅ MongoDB & Redis connected');
}

// ———————————————
// 4) Save Message
// ———————————————
// services/MessageService.jsx

export async function saveMessage(msg, accessToken) {
  const response = await fetch('http://localhost:8000/avatars/message', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`, // if your backend requires auth
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      avatar_id: msg.avatarId,
      message: msg.content,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to save message');
  }

  return await response.json();
}

// ———————————————
// 5) Get Recent Messages
// ———————————————
export async function getRecentMessages(avatarId, accessToken) {
  const response = await fetch(
    'http://localhost:8000/avatars/select_all_messages',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ avatar_id: avatarId }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch messages');
  }

  const data = await response.json();
  return data.messages;
}

// ———————————————
// 6) Export Cleanly
// ———————————————
export const MessageService = {
  initDatabase,
  saveMessage,
  getRecentMessages,
};
