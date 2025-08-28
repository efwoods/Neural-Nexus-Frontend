// Updated AvatarCardComponent to match LiveChat appearance
import React from 'react';
import { User } from 'lucide-react';

const AvatarCardComponent = ({ avatar, onCardClick }) => {
  return (
    <div
      className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-16 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
      onClick={() => onCardClick(avatar)}
    >
      <div className="flex justify-center mb-8">
        {avatar.icon ? (
          <div
            className="w-32 h-32 rounded-full bg-cover bg-center bg-no-repeat border-2 border-white/20"
            style={{
              backgroundImage: `url(${avatar.icon})`,
            }}
          />
        ) : (
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">
        {avatar.avatar_name}
      </h3>
      <p className="text-white/70 text-sm">
        {avatar.description || 'Click to select this avatar'}
      </p>
    </div>
  );
};

export default AvatarCardComponent;
