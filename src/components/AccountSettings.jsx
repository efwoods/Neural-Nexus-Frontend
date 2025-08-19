// /components/AccountSettings.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const AccountSettings = () => {
  const [username, setUsername] = useState('');
  const [personalImage, setPersonalImage] = useState(null);
  const [neuralNexusKey, setNeuralNexusKey] = useState('');
  const [grokKey, setGrokKey] = useState('');
  const [grokEnabled, setGrokEnabled] = useState(false);
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [elevenLabsEnabled, setElevenLabsEnabled] = useState(false);
  const [customLLMKey, setCustomLLMKey] = useState('');
  const [customLLMEnabled, setCustomLLMEnabled] = useState(false);

  const handleUsernameChange = () => toast.success('Username updated');
  const handleImageUpload = (e) => {
    setPersonalImage(URL.createObjectURL(e.target.files[0]));
    toast.success('Image uploaded');
  };
  const handleDeleteImage = () => {
    setPersonalImage(null);
    toast.success('Image deleted');
  };
  const handleApiKeyUpdate = (service) =>
    toast.success(`${service} API key updated`);

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      <h1 className="text-3xl font-bold mb-4">Account Settings</h1>

      {/* Username */}
      <div className="flex flex-col gap-2">
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={handleUsernameChange}
          className="bg-teal-600 px-4 py-2 rounded"
        >
          Change Username
        </button>
      </div>

      {/* Personal Image */}
      <div className="flex flex-col gap-2">
        <label>Personal Image</label>
        {personalImage && (
          <img
            src={personalImage}
            alt="Personal"
            className="w-32 h-32 rounded-full"
          />
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {personalImage && (
          <button
            onClick={handleDeleteImage}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Delete Image
          </button>
        )}
      </div>

      {/* API Keys */}
      <div className="flex flex-col gap-2">
        <label>Neural Nexus API Key</label>
        <input
          type="text"
          value={neuralNexusKey}
          onChange={(e) => setNeuralNexusKey(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={() => handleApiKeyUpdate('Neural Nexus')}
          className="bg-teal-600 px-4 py-2 rounded"
        >
          Update
        </button>

        <label>Grok API Key</label>
        <input
          type="text"
          value={grokKey}
          onChange={(e) => setGrokKey(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={grokEnabled}
            onChange={() => setGrokEnabled(!grokEnabled)}
          />
          <span>Enable Grok Imagine</span>
        </div>
        <button
          onClick={() => handleApiKeyUpdate('Grok')}
          className="bg-teal-600 px-4 py-2 rounded"
        >
          Update
        </button>

        <label>ElevenLabs API Key</label>
        <input
          type="text"
          value={elevenLabsKey}
          onChange={(e) => setElevenLabsKey(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={elevenLabsEnabled}
            onChange={() => setElevenLabsEnabled(!elevenLabsEnabled)}
          />
          <span>Enable ElevenLabs</span>
        </div>
        <button
          onClick={() => handleApiKeyUpdate('ElevenLabs')}
          className="bg-teal-600 px-4 py-2 rounded"
        >
          Update
        </button>

        <label>Custom LLM API Key</label>
        <input
          type="text"
          value={customLLMKey}
          onChange={(e) => setCustomLLMKey(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={customLLMEnabled}
            onChange={() => setCustomLLMEnabled(!customLLMEnabled)}
          />
          <span>Enable Custom LLM</span>
        </div>
        <button
          onClick={() => handleApiKeyUpdate('Custom LLM')}
          className="bg-teal-600 px-4 py-2 rounded"
        >
          Update
        </button>
      </div>

      {/* Billing / Subscription */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Billing & Subscription</h2>
        <button className="bg-teal-600 px-4 py-2 rounded">Go to Billing</button>
        <button className="bg-red-600 px-4 py-2 rounded">
          Cancel Subscription
        </button>
        <button className="bg-blue-600 px-4 py-2 rounded">
          Download My Data
        </button>
        <button className="bg-red-800 px-4 py-2 rounded">Delete Account</button>
      </div>
    </div>
  );
};

export default AccountSettings;
