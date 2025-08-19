// components/AvatarSettings.jsx
import React, { useState, useEffect } from 'react';
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

const AvatarSettings = ({ avatarId, accessToken }) => {
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [files, setFiles] = useState([]);
  const [avatarData, setAvatarData] = useState({
    name: '',
    description: '',
    iconUrl: '',
  });
  const [editingDesc, setEditingDesc] = useState(false);
  const [updatedDesc, setUpdatedDesc] = useState('');
  const [researching, setResearching] = useState(false);
  const [researchResults, setResearchResults] = useState([]);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  useEffect(() => {
    if (!avatarId) return;

    fetch(`/api/avatars/${avatarId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAvatarData(data);
        setUpdatedDesc(data.description || '');
      })
      .catch(() => toast.error('Failed to load avatar info'));

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

  const handleDescSave = async () => {
    await fetch(`/api/avatars/${avatarId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ description: updatedDesc }),
    });
    setAvatarData({ ...avatarData, description: updatedDesc });
    setEditingDesc(false);
    toast.success('Description updated');
  };

  const handleIconUpload = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('icon', acceptedFiles[0]);
    await fetch(`/api/avatars/${avatarId}/icon`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    setAvatarData({
      ...avatarData,
      iconUrl: URL.createObjectURL(acceptedFiles[0]),
    });
    toast.success('Avatar icon updated');
  };

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

  const handleUpload = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    await fetch(`/api/avatars/${avatarId}/upload`, {
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

  const handleAction = async (fileId, action) => {
    await fetch(`/api/avatars/${avatarId}/${action}/${fileId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setFiles(
      files.map((f) => (f._id === fileId ? { ...f, status: action } : f))
    );
    toast.success(`File ${action} started`);
  };

  const handleResearch = async () => {
    if (!avatarData.name) return toast.error('Avatar name required');
    setResearching(true);
    setResearchResults([]);
    toast.loading('Research agent started');
    try {
      const res = await fetch(
        `/api/research-agent?name=${encodeURIComponent(avatarData.name)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setResearchResults(await res.json());
      setApprovalDialogOpen(true);
    } catch (err) {
      toast.error('Research agent failed');
    } finally {
      setResearching(false);
      toast.dismiss();
    }
  };

  const handleApprove = async (result) => {
    try {
      const res = await fetch(`/api/avatars/${avatarId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          url: result.url,
          type: result.type,
          snippet: result.snippet,
        }),
      });
      if (!res.ok) throw new Error('Failed to add document');
      setLinks([...links, { url: result.url, status: 'pending' }]);
      setResearchResults(researchResults.filter((r) => r.url !== result.url));
      toast.success('Link added to documents');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col p-2">
      <Card className="flex-grow flex flex-col gap-3 p-3 overflow-auto rounded-xl">
        <h2 className="text-lg font-bold">Avatar Info & Documents</h2>

        {/* <div className="flex flex-col gap-2 mb-2">
          <Button size="small" onClick={handleResearch} disabled={researching}>
            {researching && <CircularProgress size={18} className="mr-1" />}
            Run Research Agent
          </Button>
        </div>

        <Dialog
          open={approvalDialogOpen}
          onClose={() => setApprovalDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Approve Research Results</DialogTitle>
          <DialogContent dividers>
            {researchResults.length ? (
              researchResults.map((r, idx) => (
                <Card key={idx} className="p-2 mb-2 border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-700 truncate">{r.url}</p>
                      <p className="text-xs text-gray-500">{r.snippet}</p>
                    </div>
                    <Button size="small" onClick={() => handleApprove(r)}>
                      Approve
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No results pending approval.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button size="small" onClick={() => setApprovalDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog> */}

        {/* Icon & Description */}
        <div className="flex gap-3 items-start">
          {avatarData.iconUrl ? (
            // Show existing icon with edit overlay
            <div className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer">
              <img
                src={avatarData.iconUrl}
                alt="avatar"
                className="w-full h-full object-cover"
                onClick={() => document.getElementById('icon-dropzone').click()}
              />
              <div className="absolute top-0 right-0 bg-black/50 p-1 rounded-bl cursor-pointer">
                <Edit3 size={14} />
              </div>
              <Dropzone
                id="icon-dropzone"
                onDrop={handleIconUpload}
                multiple={false}
                accept={{ 'image/*': [] }}
              >
                {({ getInputProps }) => <input {...getInputProps()} hidden />}
              </Dropzone>
            </div>
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
                  <Button size="small" onClick={handleDescSave}>
                    Save
                  </Button>
                  <Button size="small" onClick={() => setEditingDesc(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-gray-700 flex-grow">
                  {avatarData.description || 'No description yet'}
                </p>
                <Button size="small" onClick={() => setEditingDesc(true)}>
                  Edit
                </Button>
              </div>
            )}
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
              placeholder="Enter social media link"
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
                className="flex-grow border border-dashed p-3 text-center text-gray-500 hover:bg-gray-100 cursor-pointer rounded overflow-y-auto flex items-center justify-center"
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
                    <div className="flex gap-1">
                      <Button
                        size="small"
                        onClick={() => handleAction(file._id, 'preprocess')}
                      >
                        {file.status === 'preprocessing' && (
                          <Loader2 className="animate-spin mr-1" size={14} />
                        )}
                        Preprocess
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleAction(file._id, 'train')}
                      >
                        Train
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          window.open(`/preprocessed/${file._id}`, '_blank')
                        }
                      >
                        <Edit3 size={14} className="mr-1" /> Edit
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleAction(file._id, 'delete')}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
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
