import React from 'react';
import { CirclePlus } from 'lucide-react';

const CreateAvatarComponent = ({ onCardClick }) => {
  return (
    <div
      className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-16 text-center cursor-pointer hover:bg-white/10 transition-all duration-300"
      onClick={() => onCardClick({ type: 'create', id: 'create-avatar' })}
    >
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20 hover:border-white/40 transition-all duration-300">
          <CirclePlus className="w-16 h-16 text-gray-400 opacity-20" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Create Avatar</h3>
      <p className="text-white/70 text-sm">Click to create a new avatar</p>
    </div>
  );
};

export default CreateAvatarComponent;
