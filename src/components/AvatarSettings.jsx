// components/AvatarSettings.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Input,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import Dropzone from 'react-dropzone';
import { ExternalLink, Trash2, Loader2, Edit3 } from 'lucide-react';
import { useNgrokApiUrl } from '../context/NgrokAPIContext';
import { useAuth } from '../context/AuthContext';
import { AvatarService } from '../services/AvatarService';

const AvatarSettings = ({ avatarId, accessToken }) => {
  const { dbHttpsUrl } = useNgrokApiUrl();
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [files, setFiles] = useState([]);
  const [editingDesc, setEditingDesc] = useState(false);
  const [updatedDesc, setUpdatedDesc] = useState('');
  const [updatedIcon, setUpdatedIcon] = useState('');
  const [updatedAvatarName, setUpdatedAvatarName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [researching, setResearching] = useState(false);
  const [researchResults, setResearchResults] = useState([]);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const {
    activeAvatar,
    selectAvatar,
    updateActiveAvatarField,
    setActiveAvatar,
  } = useAuth();
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

      // setActiveAvatar(avatarProfileData);
      setUpdatedDesc(avatarProfileData.description);
      setUpdatedIcon(avatarProfileData.icon_url);
      setUpdatedAvatarName(avatarProfileData.name);

      // return avatarProfileData; // Add this line
    } catch (err) {
      console.error('Failed to fetch avatar profile:', err);
      // return null; // Optional: return null on error
    }
  };

  const fetchAvatarData = async () => {
    if (!activeAvatar?.avatar_id || !accessToken) return;

    try {
      const avatarProfileData = await AvatarService.selectAvatar(
        accessToken,
        activeAvatar.avatar_id
      );
      console.log('fetchAvatarData icon', avatarProfileData.icon_url);
      // setActiveAvatar(avatarProfileData);

      return avatarProfileData; // Add this line
    } catch (err) {
      console.error('Failed to fetch avatar profile:', err);
      return null; // Optional: return null on error
    }
  };

  useEffect(() => {
    initialPopulationOfAvatarData();
  }, []);

  const handleIconUpload = async (acceptedFiles) => {
    // console.log(acceptedFiles);
    // console.log(acceptedFiles[0].File);

    const formData = new FormData();
    formData.append('icon', acceptedFiles[0]);
    formData.append('avatar_id', activeAvatar.avatar_id);
    await fetch(`${dbHttpsUrl}/management/avatars/update`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    const avatarProfileData = await fetchAvatarData();
    // setUpdatedDesc(avatarProfileData.description);
    setUpdatedIcon(avatarProfileData.icon_url);
    // setUpdatedAvatarName(avatarProfileData.name);
    // toast.success('Avatar icon updated');
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
    setLinks([...links, { url: newLink, status: 'pending' }]); // placeholder
    setNewLink(''); // placeholder
    toast.success('Social media link added, ready to collect data...');
  };

  const handleUpload = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles);
    formData.append('avatar_id', avatarId);
    await fetch(`/management/avatars/update`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    setFiles([...files, { name: acceptedFiles.name, status: 'preprocessing' }]);
    toast.success('File uploaded & preprocessing started');
  };

  const handleDescSave = async (updatedDesc) => {
    console.log('inside desc save');
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
      // setUpdatedIcon(avatarProfileData.icon_url);
      // setUpdatedAvatarName(avatarProfileData.name);
      console.log('this should be updated', activeAvatar.description);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateName = async (updatedAvatarName) => {
    console.log('inside desc save');
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
      // setUpdatedDesc(avatarProfileData.description);
      // setUpdatedIcon(avatarProfileData.icon_url);
      setUpdatedAvatarName(avatarProfileData.name);
      console.log('this should be updated', activeAvatar.name);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="h-screen bg-gray-300 flex flex-col p-2">
      <Card className="flex-grow flex flex-col gap-3 p-3 overflow-auto rounded-xl">
        <h2 className="text-lg font-bold">Avatar Info & Documents</h2>
        {/* Icon & Description */}
        <div className="flex gap-3 items-start">
          {updatedIcon ? (
            <Dropzone
              onDrop={handleIconUpload}
              multiple={false}
              accept={{ 'image/*': [] }}
              noClick
            >
              {({ getRootProps, getInputProps, open }) => (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer">
                  <img
                    src={updatedIcon}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onClick={open}
                  />
                  <div
                    className="absolute top-0 right-0 bg-black/50 p-1 rounded-bl cursor-pointer"
                    onClick={open}
                  >
                    <Edit3 size={14} color="white" />
                  </div>
                  <input {...getInputProps()} />
                </div>
              )}
            </Dropzone>
          ) : (
            // Fallback Dropzone if no icon
            <Dropzone onDrop={handleIconUpload} multiple={false}>
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="w-24 h-24 border border-dashed flex items-center justify-center cursor-pointer rounded-lg"
                >
                  <input {...getInputProps()} />
                  <p className="text-xs text-gray-500 text-center">
                    Drag & drop an icon here or click to upload
                  </p>
                </div>
              )}
            </Dropzone>
          )}
          {/* Name and Description Fields */}
          <div className="flex-grow">
            {/* Name Field */}
            <div className="mb-3">
              <h3 className="font-semibold text-sm mb-1">Name</h3>
              {editingName ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={updatedAvatarName}
                    onChange={(e) => setUpdatedAvatarName(e.target.value)}
                    placeholder="Enter avatar name"
                    className="flex-grow p-1"
                  />
                  <Button
                    size="small"
                    onClick={() => {
                      handleUpdateName(updatedAvatarName);
                      setEditingName(false);
                    }}
                  >
                    Save
                  </Button>
                  <Button size="small" onClick={() => setEditingName(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 flex-grow font-medium">
                    {updatedAvatarName || 'No name yet'}
                  </p>
                  <Button size="small" onClick={() => setEditingName(true)}>
                    Edit
                  </Button>
                </div>
              )}

              {/* Description Field */}
              <div className="mb-3">
                <h3 className="font-semibold text-sm mb-1">Description</h3>
                {editingDesc ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                      <Input
                        value={updatedDesc}
                        onChange={(e) => setUpdatedDesc(e.target.value)}
                        placeholder="Enter description"
                        className="flex-grow p-1"
                      />
                      <Button
                        size="small"
                        onClick={() => {
                          handleDescSave(updatedDesc);
                          setEditingDesc(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setEditingDesc(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700 flex-grow">
                      {updatedDesc || 'No description yet'}
                    </p>
                    <Button size="small" onClick={() => setEditingDesc(true)}>
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-2">
          <h3 className="font-semibold text-sm mb-1">Social Media Links</h3>

          {/* Input for new link */}
          <div className="flex gap-2 mb-2">
            <Input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="These links will appear on your avatar in the chat area."
              className="flex-grow p-1"
            />
            <Button size="small" onClick={handleAddLink}>
              Add
            </Button>
          </div>

          {/* Existing links */}
          <ul className="space-y-1">
            {links.map((link, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center text-gray-700"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={14} /> {link.url}
                </a>
                <span className="text-xs">{link.status || 'scraping'}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Data Links */}
        <div className="mb-2">
          <h3 className="font-semibold text-sm mb-1">Website Data Links</h3>

          {/* Input for new link */}
          <div className="flex gap-2 mb-2">
            <Input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="These links will be used to train your avatar in the future."
              className="flex-grow p-1"
            />
            <Button size="small" onClick={handleAddLink}>
              Add
            </Button>
          </div>

          {/* Existing links */}
          <ul className="space-y-1">
            {links.map((link, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center text-gray-700"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={14} /> {link.url}
                </a>
                <span className="text-xs">{link.status || 'scraping'}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Media Files */}
        <div className="mt-2">
          <h3 className="font-semibold text-sm mb-1">Media Files</h3>
          {/* Upload */}
          <Dropzone onDrop={handleUpload}>
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className="flex-grow border border-dashed p-3 text-center text-gray-500 hover:bg-gray-200 cursor-pointer rounded overflow-y-auto flex items-center justify-center"
              >
                <input {...getInputProps()} />
                <p>Drag & drop media here or click to upload</p>
              </div>
            )}
          </Dropzone>

          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((file) => (
                <li
                  key={file._id || file.name}
                  className="flex flex-col gap-1 border-b pb-1"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span>{file.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LinearProgress
                      value={
                        file.status === 'preprocessing'
                          ? 50
                          : file.status === 'trained'
                          ? 100
                          : 0
                      }
                      className="flex-grow h-1 rounded"
                    />
                    <span className="text-xs text-gray-500">{file.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AvatarSettings;
