import React from 'react';
import { PanelTopCloseIcon, PanelTopOpenIcon } from 'lucide-react';
import NeuralNexusLogo from '../assets/NeuralNexus.png';
import AuthComponent from './AuthComponent';

const Header = ({ sidebarVisible, setSidebarVisible }) => {
  return (
    <header className="w-full bg-black/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50 rounded-2xl px-2">
      <div className="flex justify-between items-center px-2 py-3 max-w-7xl mx-auto">
        {/* Left side: Avatar/Sidebar toggle button */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarVisible((v) => !v)}
            className="text-sm px-2 sm:px-4 py-1 sm:py-2 transition-transform duration-300 hover:scale-105 rounded hover:bg-cyan-600 transition-colors focus:outline focus:outline-2 focus:outline-cyan-400 border border-gray-700 text-white bg-black/35 font-semibold shadow-lg flex items-center justify-center"
            aria-label={sidebarVisible ? 'Close Sidebar' : 'Open Sidebar'}
          >
            {sidebarVisible ? (
              <PanelTopCloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <PanelTopOpenIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>

        {/* Center: Neural Nexus title */}
        <div className="flex-1 flex justify-center items-center">
          <p className="text-sm sm:text-base font-bold text-white tracking-wide">
            Neural Nexus
          </p>
        </div>

        {/* Right side: Auth component */}
        <div className="flex items-center">
          <AuthComponent />
        </div>
      </div>
    </header>
  );
};

export default Header;
