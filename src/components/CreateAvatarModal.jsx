import React, { useState, useEffect } from 'react';
import { UserPenIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const CreateAvatarModal = ({ setShowCreateModal }) => {
  const { createAvatar } = useAuth();
  const [loading, setLoading] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [newAvatarName, setNewAvatarName] = useState('');
  const [newAvatarDescription, setNewAvatarDescription] = useState('');

  const handleCreate = async () => {
    if (!newAvatarName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const created = await createAvatar({
        name: newAvatarName,
        description: newAvatarDescription,
      });
      if (created) {
        setShowCreateModal(false);
        setNewAvatarName('');
        setNewAvatarDescription('');
      } else {
        setError('Failed to create avatar');
      }
    } catch (err) {
      setError(err.message || 'Failed to create avatar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowCreateModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowCreateModal]);

  return (
    <div
      className="fixed inset-0 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 bg-opacity-75 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-avatar-title"
    >
      <div className="bg-gray/20 p-4 sm:p-6 rounded-lg w-[90vw] sm:w-96 max-w-full">
        <h2
          id="create-avatar-title"
          className="text-xl font-semibold mb-4 text-white"
        >
          <div className="flex items-center gap-2">
            <UserPenIcon className="w-6 h-6" />
            <span className="portrait:hidden">Create Avatar</span>
          </div>
        </h2>
        <label className="block mb-2 text-xl sm:text-2xl text-gray-300">
          Name
          <input
            type="text"
            value={newAvatarName}
            onChange={(e) => setNewAvatarName(e.target.value)}
            className="w-full p-2 mt-1 rounded bg-black/35 from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
            autoFocus
            aria-required="true"
          />
        </label>
        <label className="block mb-4 text-xl sm:text-2xl text-gray-300 ">
          Description
          <textarea
            value={newAvatarDescription}
            onChange={(e) => setNewAvatarDescription(e.target.value)}
            className="w-full p-2 mt-1 rounded bg-black/35 from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
            rows={3}
            aria-multiline="true"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowCreateModal(false)}
            className="transition-transform duration-300 hover:scale-105 px-4 py-2 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 min-w-0 rounded px-3 py-2 border border-gray-700 text-white bg-black/35 from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 transform shadow-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="transition-transform duration-300 hover:scale-105 px-4 py-2 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 min-w-0 rounded px-3 py-2 border border-gray-700 text-white bg-black/35 from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 transform shadow-lg"
            disabled={!newAvatarName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAvatarModal;
