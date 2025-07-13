//components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { UserPenIcon, User, Trash2, GripVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthComponent from './AuthComponent';
import AnimatedList from './AnimatedList';

const Sidebar = ({ setShowCreateModal, isOpen, onClose }) => {
  const {
    isLoggedIn,
    accessToken,
    avatars,
    activeAvatar,
    setActiveAvatar,
    deleteAvatar,
    getAvatars,
    updateAvatarOrder, // You'll need to add this to your AuthContext
  } = useAuth();

  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverItem, setDraggedOverItem] = useState(null);
  const [localAvatars, setLocalAvatars] = useState([]);

  // Update local avatars when avatars prop changes
  useEffect(() => {
    setLocalAvatars(avatars || []);
  }, [avatars]);

  // Handle avatar selection and close sidebar
  const handleAvatarSelect = (avatar) => {
    setActiveAvatar(avatar);
  };

  // Handle create avatar button click and close sidebar
  const handleCreateAvatar = () => {
    setShowCreateModal(true);
    onClose?.();
  };

  // Drag and drop handlers
  const handleDragStart = (e, avatar, index) => {
    setDraggedItem({ avatar, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.dataTransfer.setDragImage(e.target, 0, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverItem(index);
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the container, not just moving between children
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggedOverItem(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.index === dropIndex) {
      setDraggedItem(null);
      setDraggedOverItem(null);
      return;
    }

    const newAvatars = [...localAvatars];
    const draggedAvatar = newAvatars[draggedItem.index];

    // Remove the dragged item
    newAvatars.splice(draggedItem.index, 1);

    // Insert at new position
    newAvatars.splice(dropIndex, 0, draggedAvatar);

    // Update local state immediately for responsive UI
    setLocalAvatars(newAvatars);

    // Update the order in your backend/context
    if (updateAvatarOrder) {
      updateAvatarOrder(newAvatars);
    }

    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  // Render each avatar item with drag functionality
  const renderAvatarItem = (avatar, index, isSelected) => {
    const isActive = activeAvatar?.avatar_id === avatar.avatar_id;
    const isDragging = draggedItem?.index === index;
    const isDraggedOver = draggedOverItem === index;

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, avatar, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
        onDragEnd={handleDragEnd}
        className={`
          flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 
          ${
            isActive
              ? 'bg-white/20 text-white shadow-lg scale-[1.02]'
              : 'hover:bg-white/10 text-gray-300 hover:text-white'
          }
          ${isDragging ? 'opacity-50 transform rotate-2' : ''}
          ${isDraggedOver ? 'bg-white/30 transform scale-105' : ''}
        `}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAvatarSelect(avatar);
          if (e.key === 'Delete') deleteAvatar(avatar.avatar_id);
        }}
        onClick={() => handleAvatarSelect(avatar)}
      >
        {/* Drag Handle */}
        <div
          className="flex-shrink-0 text-gray-400 hover:text-white cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <User className="w-6 h-6" />

        <div className="flex-grow min-w-0">
          <div className="font-semibold text-sm sm:text-base whitespace-normal">
            {avatar.name}
          </div>
          <div className="text-xs text-gray-400 mt-1 whitespace-normal">
            {avatar.description}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteAvatar(avatar.avatar_id);
          }}
          className="flex-shrink-0 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
          aria-label={`Delete avatar ${avatar.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Sliding Panel */}
      <div
        className={`
          fixed top-0 left-0
          w-80 sm:w-96 lg:w-80
          h-full
          z-50
          bg-white/5 backdrop-blur-lg
          border-r border-white/20 lg:rounded-2xl lg:border
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-lg
        `}
      >
        <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Avatars</h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Create Avatar Button or Auth */}
          {isLoggedIn ? (
            <button
              onClick={handleCreateAvatar}
              className="px-4 py-2 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 border border-gray-700 text-white bg-black/35 flex font-semibold gap-2 items-center justify-center"
            >
              <UserPenIcon className="w-6 h-6" />
              <span className="sm:inline">Create Avatar</span>
            </button>
          ) : (
            <div className="flex items-center justify-center">
              <AuthComponent />
            </div>
          )}

          {/* Avatar List */}
          <div className="flex-grow overflow-y-auto min-h-0 space-y-2">
            {Array.isArray(localAvatars) && localAvatars.length > 0 ? (
              <div className="space-y-2">
                {localAvatars.map((avatar, index) => (
                  <div key={avatar.avatar_id}>
                    {renderAvatarItem(
                      avatar,
                      index,
                      activeAvatar?.avatar_id === avatar.avatar_id
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm p-4 italic text-center">
                {isLoggedIn
                  ? 'No avatars available. Create one to get started.'
                  : 'No avatars available. Sign up or Log in to get started.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
