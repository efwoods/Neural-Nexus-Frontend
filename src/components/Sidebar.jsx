import React, { useEffect } from 'react';
import { UserPenIcon, User, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedList from './AnimatedList';

const Sidebar = ({ setShowCreateModal }) => {
  const {
    isLoggedIn,
    accessToken,
    avatars,
    activeAvatar,
    setActiveAvatar,
    deleteAvatar,
    getAvatars,
  } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      getAvatars(accessToken);
    }
  }, [isLoggedIn]);

  // Render each avatar with name, description, icons, delete button
  const renderAvatarItem = (avatar, index, isSelected) => (
    <div
      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors duration-300 ${
        isSelected
          ? 'bg-white-600 text-white'
          : 'hover:bg-teal-700 text-gray-300'
      } focus:outline focus:outline-2 focus:outline-teal-400`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setActiveAvatar(avatar);
        if (e.key === 'Delete') deleteAvatar(avatar.avatar_id);
      }}
      onClick={() => setActiveAvatar(avatar)}
    >
      <User className="w-6 h-6" />
      <div className="flex flex-col flex-grow">
        <span className="font-semibold break-words">{avatar.name}</span>
        <span className="text-xs text-gray-400 break-words">
          {avatar.description}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteAvatar(avatar.avatar_id);
        }}
        className="ml-auto text-red-400 hover:text-red-600 focus:outline focus:outline-2 focus:outline-red-400"
        aria-label={`Delete avatar ${avatar.name}`}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div
      className={`transition-all duration-300 ease-in-out transform ${
        isLoggedIn ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative w-full h-full`} // <-- FULL HEIGHT
    >
      <div className="w-full h-full bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-4 overflow-y-auto flex flex-col gap-4">
        {isLoggedIn && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="transition-transform duration-300 hover:scale-105 px-4 py-2 rounded hover:bg-teal-600 transition-colors focus:outline focus:outline-2 focus:outline-teal-400 min-w-0 rounded px-3 py-2 border border-gray-700 text-white bg-black/35 from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 px-6 py-3 rounded-xl flex font-semibold gap-2 transition-all duration-300 transform shadow-lg items-center justify-center"
          >
            <UserPenIcon className="w-6 h-6" />
          </button>
        )}

        <div className="flex flex-col gap-2 mt-2 flex-grow">
          {' '}
          {/* allow to expand */}
          {Array.isArray(avatars) && avatars.length > 0 ? (
            <AnimatedList
              items={avatars}
              onItemSelect={setActiveAvatar}
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={true}
              renderItem={renderAvatarItem}
              initialSelectedIndex={avatars.findIndex(
                (a) => a.avatar_id === activeAvatar?.avatar_id
              )}
            />
          ) : isLoggedIn ? (
            <div className="text-sm text-gray-400 text-center break-words">
              No avatars yet. Click the{' '}
              <UserPenIcon className="inline w-4 h-4 align-text-bottom " />{' '}
              button above to create one.
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center">
              Please log in to view your avatars.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
