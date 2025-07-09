import { Ear, EarOff, Eye } from 'lucide-react';

const DockButton = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  disabled = false,
}) => (
  <div className="relative group">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-3 rounded-xl transition-all duration-300 transform
        flex items-center justify-center min-w-[48px] h-12
        ${
          isActive
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
            : 'bg-black/40 border border-white/20 text-white hover:bg-black/60 hover:scale-105 hover:border-white/40'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        backdrop-blur-sm
      `}
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </button>
    {/* Tooltip */}
    <span
      className="absolute -top-12 left-1/2 transform -translate-x-1/2 
                     bg-black/90 text-white text-xs rounded-lg py-2 px-3 
                     whitespace-nowrap opacity-0 group-hover:opacity-100 
                     transition-opacity duration-200 pointer-events-none z-30
                     before:content-[''] before:absolute before:top-full 
                     before:left-1/2 before:transform before:-translate-x-1/2 
                     before:border-4 before:border-transparent before:border-t-black/90"
    >
      {label}
    </span>
  </div>
);

const Dock = ({
  isTranscribing,
  startTranscription,
  stopTranscription,
  isThoughtToImageEnabled,
  startThoughtToImage,
  stopThoughtToImage,
  dataExchangeTypes,
}) => {
  const buttons = [
    {
      icon: isTranscribing ? EarOff : Ear,
      label: isTranscribing ? 'Stop Suggestions' : 'Start Suggestions',
      isActive: isTranscribing,
      onClick: isTranscribing ? stopTranscription : startTranscription,
      disabled: !dataExchangeTypes.voice,
    },
    {
      icon: Eye,
      label: isThoughtToImageEnabled
        ? 'Disable Thought-To-Image'
        : 'Enable Thought-To-Image',
      isActive: isThoughtToImageEnabled,
      onClick: isThoughtToImageEnabled
        ? stopThoughtToImage
        : startThoughtToImage,
      disabled: !dataExchangeTypes.neuralImage,
    },
  ];

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center gap-2 rounded-2xl shadow-2xl portrait:overflow-x-auto">
        {buttons.map((button, index) => (
          <DockButton
            key={index}
            icon={button.icon}
            label={button.label}
            isActive={button.isActive}
            onClick={button.onClick}
            disabled={button.disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default Dock;
