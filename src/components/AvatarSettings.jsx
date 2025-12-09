// components/AvatarSettings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Dropzone from 'react-dropzone';
import {
  ExternalLink,
  Trash2,
  Edit3,
  Upload,
  Link as LinkIcon,
  File,
} from 'lucide-react';
import { useNgrokApiUrl } from '../context/NgrokAPIContext';
import { useAuth } from '../context/AuthContext';
import { AvatarService } from '../services/AvatarService';

const AvatarSettings = ({ avatarId, accessToken, onAvatarDeleted }) => {
  const { dbHttpsUrl } = useNgrokApiUrl();
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [files, setFiles] = useState([]);
  const [editingDesc, setEditingDesc] = useState(false);
  const [updatedDesc, setUpdatedDesc] = useState('');
  const [updatedIcon, setUpdatedIcon] = useState('');
  const [updatedAvatarName, setUpdatedAvatarName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { activeAvatar, setActiveAvatar, deleteAvatar, getAvatars } = useAuth();

  const hasRun = useRef(false);

  const initialPopulationOfAvatarData = async () => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!activeAvatar?.avatar_id || !accessToken) return;

    try {
      const avatarProfileData = await AvatarService.selectAvatar(
        accessToken,
        activeAvatar.avatar_id
      );
      setUpdatedDesc(avatarProfileData.description);
      setUpdatedIcon(avatarProfileData.icon_url);
      setUpdatedAvatarName(avatarProfileData.name);
    } catch (err) {
      console.error('Failed to fetch avatar profile:', err);
    }
  };

  const fetchAvatarData = async () => {
    if (!activeAvatar?.avatar_id || !accessToken) return;

    try {
      const avatarProfileData = await AvatarService.selectAvatar(
        accessToken,
        activeAvatar.avatar_id
      );
      return avatarProfileData;
    } catch (err) {
      console.error('Failed to fetch avatar profile:', err);
      return null;
    }
  };

  useEffect(() => {
    initialPopulationOfAvatarData();
  }, []);

  const handleIconUpload = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('icon', acceptedFiles[0]);
    formData.append('avatar_id', activeAvatar.avatar_id);

    await fetch(`${dbHttpsUrl}/management/avatars/update`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    const avatarProfileData = await fetchAvatarData();
    setUpdatedIcon(avatarProfileData.icon_url);
    toast.success('Avatar icon updated');
  };

  const handleAddLink = async () => {
    if (!newLink.trim()) return;

    await fetch(`${dbHttpsUrl}/management/avatars/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ avatar_id: avatarId, url: newLink }),
    });

    setLinks([...links, { url: newLink, status: 'pending' }]);
    setNewLink('');
    toast.success('Social media link added, ready to collect data...');
  };

  const handleUpload = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    formData.append('avatar_id', avatarId);

    await fetch(`${dbHttpsUrl}/management/avatars/update`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    setFiles([
      ...files,
      { name: acceptedFiles[0].name, status: 'preprocessing' },
    ]);
    toast.success('File uploaded & preprocessing started');
  };

  const handleDescSave = async (updatedDesc) => {
    const formData = new FormData();
    formData.append('description', updatedDesc);
    formData.append('avatar_id', activeAvatar.avatar_id);

    try {
      await fetch(`${dbHttpsUrl}/management/avatars/update`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const avatarProfileData = await fetchAvatarData();
      setUpdatedDesc(avatarProfileData.description);
      toast.success('Description updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateName = async (updatedAvatarName) => {
    const formData = new FormData();
    formData.append('name', updatedAvatarName);
    formData.append('avatar_id', activeAvatar.avatar_id);

    try {
      await fetch(`${dbHttpsUrl}/management/avatars/update`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const avatarProfileData = await fetchAvatarData();
      setUpdatedAvatarName(avatarProfileData.name);
      toast.success('Name updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAvatar = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this avatar? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      // Use the deleteAvatar method from AuthContext
      await deleteAvatar(activeAvatar.avatar_id);

      toast.success('Avatar deleted successfully');

      // Call the onAvatarDeleted callback if provided
      if (onAvatarDeleted) {
        onAvatarDeleted();
      }
    } catch (err) {
      console.error('Delete avatar error:', err);
      toast.error(err.message || 'Failed to delete avatar');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header with Delete Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Avatar Settings</h2>
        <button
          onClick={handleDeleteAvatar}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 border border-red-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
          {isDeleting ? 'Deleting...' : 'Delete Avatar'}
        </button>
      </div>

      {/* Avatar Profile Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Profile Information
        </h3>

        <div className="flex gap-6 items-start">
          {/* Icon Upload */}
          {updatedIcon ? (
            <Dropzone
              onDrop={handleIconUpload}
              multiple={false}
              accept={{ 'image/*': [] }}
              noClick
            >
              {({ getRootProps, getInputProps, open }) => (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden cursor-pointer group">
                  <img
                    src={updatedIcon}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    onClick={open}
                  >
                    <Edit3 size={24} color="white" />
                  </div>
                  <input {...getInputProps()} />
                </div>
              )}
            </Dropzone>
          ) : (
            <Dropzone onDrop={handleIconUpload} multiple={false}>
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="w-32 h-32 border-2 border-dashed border-white/30 hover:border-white/50 flex items-center justify-center cursor-pointer rounded-2xl bg-white/5 transition-all duration-300"
                >
                  <input {...getInputProps()} />
                  <Upload size={32} className="text-white/50" />
                </div>
              )}
            </Dropzone>
          )}

          {/* Name and Description */}
          <div className="flex-grow space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Name
              </label>
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={updatedAvatarName}
                    onChange={(e) => setUpdatedAvatarName(e.target.value)}
                    placeholder="Enter avatar name"
                    className="flex-grow px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    onClick={() => {
                      handleUpdateName(updatedAvatarName);
                      setEditingName(false);
                    }}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 border border-blue-500/30"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-white font-medium">
                    {updatedAvatarName || 'No name yet'}
                  </span>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Description
              </label>
              {editingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={updatedDesc}
                    onChange={(e) => setUpdatedDesc(e.target.value)}
                    placeholder="Enter description"
                    rows="3"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleDescSave(updatedDesc);
                        setEditingDesc(false);
                      }}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 border border-blue-500/30"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingDesc(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start px-4 py-2 bg-white/5 border border-white/10 rounded-lg min-h-[80px]">
                  <p className="text-white/80 flex-grow">
                    {updatedDesc || 'No description yet'}
                  </p>
                  <button
                    onClick={() => setEditingDesc(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-300 ml-4"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Files Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <File size={20} className="text-white/70" />
          <h3 className="text-lg font-semibold text-white">Media Files</h3>
        </div>

        <Dropzone onDrop={handleUpload}>
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={40} className="mx-auto mb-3 text-white/50" />
              <p className="text-white/70">
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag & drop media here or click to upload'}
              </p>
            </div>
          )}
        </Dropzone>

        {files.length > 0 && (
          <ul className="space-y-3 mt-4">
            {files.map((file) => (
              <li
                key={file._id || file.name}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{file.name}</span>
                  <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                    {file.status}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        file.status === 'preprocessing'
                          ? 50
                          : file.status === 'trained'
                          ? 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Social Media Links Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon size={20} className="text-white/70" />
          <h3 className="text-lg font-semibold text-white">
            Social Media Links
          </h3>
        </div>
        <p className="text-white/60 text-sm mb-4">
          These links will appear on your avatar in the chat area.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="url"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://example.com"
            className="flex-grow px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleAddLink}
            className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 border border-blue-500/30"
          >
            Add
          </button>
        </div>

        {links.length > 0 && (
          <ul className="space-y-2">
            {links.map((link, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors duration-300"
                >
                  <ExternalLink size={16} />
                  {link.url}
                </a>
                <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                  {link.status || 'scraping'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Website Data Links Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon size={20} className="text-white/70" />
          <h3 className="text-lg font-semibold text-white">
            Website Data Links
          </h3>
        </div>
        <p className="text-white/60 text-sm mb-4">
          These links will be used to train your avatar in the future.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="url"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://example.com"
            className="flex-grow px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleAddLink}
            className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 border border-blue-500/30"
          >
            Add
          </button>
        </div>

        {links.length > 0 && (
          <ul className="space-y-2">
            {links.map((link, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors duration-300"
                >
                  <ExternalLink size={16} />
                  {link.url}
                </a>
                <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                  {link.status || 'scraping'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AvatarSettings;
