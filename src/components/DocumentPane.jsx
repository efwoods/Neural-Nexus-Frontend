// components/DocumentPane.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, LinearProgress } from '@mui/material';
import { toast } from 'react-hot-toast';
import Dropzone from 'react-dropzone';
import { ExternalLink, Trash2, Loader2, Edit3 } from 'lucide-react';

const DocumentPane = ({ avatarId, accessToken }) => {
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [files, setFiles] = useState([]);

  // Load social media links + files
  useEffect(() => {
    console.log('this is an update');
    if (!avatarId) return;
    fetch(`/api/avatars/${avatarId}/links`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then(setLinks)
      .catch(() => toast.error('Failed to load links'));

    fetch(`/api/avatars/${avatarId}/documents`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then(setFiles)
      .catch(() => toast.error('Failed to load documents'));
  }, [avatarId]);

  // Add new social media link
  const handleAddLink = async () => {
    if (!newLink.trim()) return;
    await fetch(`/api/avatars/${avatarId}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ url: newLink }),
    });
    setLinks([...links, { url: newLink, status: 'pending' }]);
    setNewLink('');
    toast.success('Social media link added, scraping started');
  };

  // Upload media file
  const handleUpload = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    await fetch(`/api/avatars/${avatarId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    toast.success('File uploaded & preprocessing started');
    setFiles([
      ...files,
      { name: acceptedFiles[0].name, status: 'preprocessing' },
    ]);
  };

  // File actions
  const handleAction = async (fileId, action) => {
    await fetch(`/api/avatars/${avatarId}/${action}/${fileId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    toast.success(`File ${action} started`);
    setFiles(
      files.map((f) => (f._id === fileId ? { ...f, status: action } : f))
    );
  };

  return (
    <Card className="p-4 flex flex-col gap-4 bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl">
      <h2 className="text-xl font-bold">Documents & Media</h2>

      {/* Social Media Links */}
      <div>
        <h3 className="font-semibold mb-2">Social Media Links</h3>
        <div className="flex gap-2 mb-2">
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://twitter.com/username"
            className="flex-grow"
          />
          <Button onClick={handleAddLink}>Add</Button>
        </div>
        <ul className="space-y-1">
          {links.map((link, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center text-gray-300"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="truncate hover:underline flex items-center gap-1"
              >
                <ExternalLink size={14} /> {link.url}
              </a>
              <span className="text-xs">{link.status || 'scraping'}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Drag & Drop Upload */}
      <Dropzone onDrop={handleUpload}>
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400 hover:bg-white/10 cursor-pointer"
          >
            <input {...getInputProps()} />
            <p>Drag & drop media here, or click to upload</p>
          </div>
        )}
      </Dropzone>

      {/* Media Files List */}
      <div>
        <h3 className="font-semibold mb-2">Media Files</h3>
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file._id || file.name}
              className="flex flex-col gap-2 border-b border-white/10 pb-2"
            >
              <div className="flex justify-between items-center">
                <span>{file.name}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAction(file._id, 'preprocess')}
                  >
                    {file.status === 'preprocessing' ? (
                      <Loader2 className="animate-spin mr-1" size={14} />
                    ) : null}
                    Preprocess
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAction(file._id, 'train')}
                  >
                    Train
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      window.open(`/preprocessed/${file._id}`, '_blank')
                    }
                  >
                    <Edit3 size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(file._id, 'delete')}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              {/* Progress & Status */}
              <div className="flex items-center gap-2">
                <LinearProgress
                  value={
                    file.status === 'preprocessing'
                      ? 50
                      : file.status === 'trained'
                      ? 100
                      : 0
                  }
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{file.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default DocumentPane;
