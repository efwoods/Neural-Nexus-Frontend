import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNgrokApiUrl } from '../context/NgrokAPIContext';
import CircularGallery from './CircularGallery';
import {
  Search,
  Settings,
  CirclePlus,
  LogOut as LogOutIcon,
  X,
  UserPen,
} from 'lucide-react';
import { FiCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AuthComponent from './AuthComponent';
import CreateAvatarComponent from './CreateAvatarComponent';
import AvatarCardComponent from './AvatarCardComponent';

// Improved default images (base64-encoded PNGs, 64x64, transparent background)
const defaultIcons = {
  user: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPUlEQVR4nO3YsQ3AMAwFQU7/A3YgJiZGEAEBJ0aS3hH8Z+ABJ0aS3hH8Z+ABJ0aS3hH8Z+ABJ0aS3hH8ZwB+0gq7QzMXIgAAAABJRU5ErkJggg==', // Placeholder: 64x64 gray silhouette
  circlePlus:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAABJklEQVR4nO2YsQ3CMBBEH2kE/hmYgJiYGEAEBJ0aS3hH8J+BB5wYSXhH8J+BB5wYSXhH8J+BB5wYSXhH8J8B+EF7QjMXRAgAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAADgAQcAAAAP4gq7QzMXIgAAAABJRU5ErkJggg==', // Placeholder: 64x64 green plus
};

const AvatarSelectionComponent = ({
  setShowCreateModal,
  setActiveTab,
  onEndLiveChat,
}) => {
  const {
    isLoggedIn,
    accessToken,
    user,
    avatars,
    logout,
    setActiveAvatar,
    lastUsedAvatar,
  } = useAuth();
  const { dbHttpsUrl } = useNgrokApiUrl();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [currentPage, setCurrentPage] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const galleryRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const CARDS_PER_PAGE = 3;

  // Paginate avatars
  const totalAvatarCards = avatars?.length || 0;
  const totalPages = Math.ceil(totalAvatarCards / CARDS_PER_PAGE);
  const startIndex = currentPage * CARDS_PER_PAGE;
  const paginatedAvatars =
    avatars?.slice(startIndex, startIndex + CARDS_PER_PAGE) || [];

  // Set currentCardIndex to last_used_avatar on mount
  useEffect(() => {
    if (isLoggedIn && lastUsedAvatar && avatars?.length > 0) {
      const lastUsedIndex = avatars.findIndex(
        (avatar) => avatar.avatar_id === lastUsedAvatar
      );
      if (lastUsedIndex !== -1) {
        const page = Math.floor(lastUsedIndex / CARDS_PER_PAGE);
        const relativeIndex = lastUsedIndex % CARDS_PER_PAGE;
        setCurrentPage(page);
        setCurrentCardIndex(relativeIndex);
        if (galleryRef.current) {
          galleryRef.current.setCurrentIndex(relativeIndex);
        }
      }
    }
  }, [isLoggedIn, lastUsedAvatar, avatars]);

  // Handle click on cards
  const handleClick = async (cardData) => {
    let actualCardData = cardData;

    if (!cardData.type) {
      const matchingCard = authenticatedCards.find(
        (card) =>
          card.id === cardData.id ||
          (cardData.text && card.text === cardData.text)
      );
      if (matchingCard) actualCardData = matchingCard;
    }

    if (actualCardData.type === 'avatar') {
      try {
        const avatarId =
          actualCardData.id ||
          avatars?.find((avatar) => avatar.avatar_name === actualCardData.text)
            ?.avatar_id;
        if (!avatarId) {
          toast.error('Avatar ID not found');
          return;
        }

        const response = await axios.post(
          `${dbHttpsUrl}/management/avatars/select_avatar`,
          new URLSearchParams({ avatar_id: avatarId }).toString(),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const selectedAvatar = avatars.find(
          (avatar) => avatar.avatar_id === avatarId
        );
        setActiveAvatar(selectedAvatar);
        setActiveTab('chat');
        // toast.success(
        //   `Selected avatar: ${
        //     actualCardData.text || selectedAvatar?.avatar_name
        //   }`
        // );
      } catch (error) {
        console.error('Error selecting avatar:', error);
        toast.error('Failed to select avatar');
      }
    } else if (actualCardData.type === 'create') {
      setShowCreateModal(true);
    }
  };

  // Handle customize avatar (navigate to documents tab for selected avatar)
  const handleCustomizeAvatar = async () => {
    if (currentCardIndex === authenticatedCards.length - 1) {
      // Create Avatar card
      setShowCreateModal(true);
      return;
    }

    const selectedCard = authenticatedCards[currentCardIndex];
    if (selectedCard.type === 'avatar') {
      try {
        const avatarId =
          selectedCard.id ||
          avatars?.find((avatar) => avatar.avatar_name === selectedCard.text)
            ?.avatar_id;
        if (!avatarId) {
          toast.error('Avatar ID not found');
          return;
        }

        const response = await axios.post(
          `${dbHttpsUrl}/management/avatars/select_avatar`,
          new URLSearchParams({ avatar_id: avatarId }).toString(),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const selectedAvatar = avatars.find(
          (avatar) => avatar.avatar_id === avatarId
        );
        setActiveAvatar(selectedAvatar);
        setActiveTab('documents'); // Navigate to AvatarSettings
      } catch (error) {
        console.error('Error selecting avatar for settings:', error);
        toast.error('Failed to open avatar settings');
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    setActiveAvatar(null);
    logout();
    setDropdownOpen(false);
    onEndLiveChat?.();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Define cards: Avatars and Create Avatar
  const authenticatedCards = [
    ...paginatedAvatars.map((avatar) => ({
      id: avatar.avatar_id,
      component: (
        <AvatarCardComponent avatar={avatar} onCardClick={handleClick} />
      ),
      type: 'avatar',
      text: avatar.avatar_name,
      image: avatar.icon || defaultIcons.user,
      avatar_data: avatar,
    })),
    {
      id: 'create-avatar',
      component: <CreateAvatarComponent onCardClick={handleClick} />,
      type: 'create',
      text: 'Create Avatar',
      image: defaultIcons.circlePlus,
    },
  ];

  // Add this function to determine the correct icon to display
  const getLoginCardIcon = () => {
    // First priority: last_used_avatar icon
    if (lastUsedAvatar && avatars?.length > 0) {
      const lastUsedAvatarData = avatars.find(
        (avatar) => avatar.avatar_id === lastUsedAvatar
      );
      if (lastUsedAvatarData?.icon) {
        return lastUsedAvatarData.icon;
      }
    }

    // Second priority: user's personal icon (if you have this stored)
    // You'll need to add user.icon or user.profile_image to your user object
    if (user?.icon) {
      return user.icon;
    }

    // Third priority: default user icon
    return defaultIcons.user;
  };

  // Updated login card with dynamic icon
  const loginCard = {
    id: 'login',
    component: (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-16 text-center cursor-pointer hover:bg-white/10 transition-all duration-300">
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
            <img
              src={getLoginCardIcon()}
              alt="User Icon"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                // Fallback to default icon if image fails to load
                e.target.src = defaultIcons.user;
              }}
            />
          </div>
        </div>
        <h2 className="text-5xl font-bold text-white mb-6">
          Welcome to Neural Nexus
        </h2>
        <p className="text-white/80 mb-10 text-xl">
          Sign in or create an account to get started
        </p>
        <AuthComponent
          setActiveTab={setActiveTab}
          onEndLiveChat={onEndLiveChat}
        />
      </div>
    ),
    type: 'login',
    text: 'Sign In',
    image: getLoginCardIcon(), // Also update this for consistency
  };

  const currentCards = isLoggedIn ? authenticatedCards : [loginCard];

  // Handle dot navigation
  const handleDotClick = (index) => {
    setCurrentCardIndex(index);
    if (galleryRef.current) {
      galleryRef.current.setCurrentIndex(index);
    }
  };

  // Handle pagination
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
    setCurrentCardIndex(0);
    if (galleryRef.current) {
      galleryRef.current.setCurrentIndex(0);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    setCurrentCardIndex(0);
    if (galleryRef.current) {
      galleryRef.current.setCurrentIndex(0);
    }
  };

  // Handle search input and autocomplete
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setHighlightedIndex(-1);
    const allCards = [
      ...(avatars?.map((avatar, idx) => ({
        id: avatar.avatar_id,
        type: 'avatar',
        text: avatar.avatar_name,
        image: avatar.icon || defaultIcons.user,
        originalIndex: idx,
      })) || []),
      authenticatedCards[authenticatedCards.length - 1],
    ];
    const filteredSuggestions = allCards
      .filter((card) => card.text.toLowerCase().includes(value.toLowerCase()))
      .map((card) => ({
        ...card,
        originalIndex: card.originalIndex ?? authenticatedCards.length - 1,
      }));

    if (value && filteredSuggestions.length === 0) {
      const createAvatarCard =
        authenticatedCards[authenticatedCards.length - 1];
      setSuggestions([
        {
          id: createAvatarCard.id,
          type: createAvatarCard.type,
          text: createAvatarCard.text,
          image: createAvatarCard.image,
          originalIndex: authenticatedCards.length - 1,
        },
      ]);
    } else {
      setSuggestions(filteredSuggestions);
    }
    setIsDropdownOpen(true);
  };

  // Handle search focus
  const handleSearchFocus = () => {
    const allCards = [
      ...(avatars?.map((avatar, idx) => ({
        id: avatar.avatar_id,
        type: 'avatar',
        text: avatar.avatar_name,
        image: avatar.icon || defaultIcons.user,
        originalIndex: idx,
      })) || []),
      authenticatedCards[authenticatedCards.length - 1],
    ];
    setSuggestions(
      searchQuery &&
        allCards.every(
          (card) => !card.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
        ? [
            {
              id: authenticatedCards[authenticatedCards.length - 1].id,
              type: 'create',
              text: 'Create Avatar',
              image: defaultIcons.circlePlus,
              originalIndex: authenticatedCards.length - 1,
            },
          ]
        : allCards.map((card) => ({
            ...card,
            originalIndex: card.originalIndex ?? authenticatedCards.length - 1,
          }))
    );
    setIsDropdownOpen(true);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (index) => {
    if (index < authenticatedCards.length - 1) {
      const avatarIndex = index;
      const page = Math.floor(avatarIndex / CARDS_PER_PAGE);
      const relativeIndex = index - page * CARDS_PER_PAGE;
      setCurrentPage(page);
      setCurrentCardIndex(relativeIndex);
      if (galleryRef.current) {
        galleryRef.current.setCurrentIndex(relativeIndex);
      }
    } else {
      setCurrentCardIndex(index);
      if (galleryRef.current) {
        galleryRef.current.setCurrentIndex(index);
      }
    }
    setSearchQuery(authenticatedCards[index]?.text || '');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0 && highlightedIndex >= 0) {
      handleSuggestionSelect(suggestions[highlightedIndex].originalIndex);
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      handleSuggestionSelect(suggestions[0].originalIndex);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }
  };

  // Log state for debugging
  useEffect(() => {
    console.log(
      'Authentication state:',
      isLoggedIn,
      'Access token:',
      accessToken,
      'User:',
      user,
      'Avatars:',
      avatars,
      'Last used avatar:',
      lastUsedAvatar,
      'Current page:',
      currentPage,
      'Paginated avatars:',
      paginatedAvatars,
      'Search query:',
      searchQuery,
      'Suggestions:',
      suggestions,
      'Highlighted index:',
      highlightedIndex,
      'Dropdown open:',
      dropdownOpen
    );
    console.log('Gallery items count:', authenticatedCards.length);
    console.log(
      'Gallery items:',
      authenticatedCards.map((item) => ({
        id: item.id,
        text: item.text,
        image: item.image,
        type: item.type,
      }))
    );
    console.log('Current card index:', currentCardIndex);
  }, [
    isLoggedIn,
    accessToken,
    user,
    avatars,
    lastUsedAvatar,
    currentPage,
    paginatedAvatars,
    searchQuery,
    suggestions,
    highlightedIndex,
    authenticatedCards,
    currentCardIndex,
    dropdownOpen,
  ]);

  // Reset card index and page when authentication state or avatars change
  useEffect(() => {
    console.log(
      'Resetting card index and page, isLoggedIn:',
      isLoggedIn,
      'avatars:',
      avatars
    );
    setCurrentCardIndex(0);
    setCurrentPage(0);
    if (galleryRef.current) {
      galleryRef.current.setCurrentIndex(0);
    }
  }, [isLoggedIn, avatars]);

  return (
    <div className="flex flex-col items-center justify-start p-4 relative">
      {isLoggedIn ? (
        <div className="w-full max-w-[1920px] flex flex-col items-center gap-2">
          {/* Search Bar */}
          <div className="relative w-full max-w-md mt-8 mb-2" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={handleSearchFocus}
              onKeyDown={handleKeyDown}
              placeholder="Search avatars..."
              className="w-full bg-white/5 rounded-lg border border-white/20 py-2 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/80" />
            {isDropdownOpen && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white/10 rounded-lg border border-white/20 mt-1 max-h-60 overflow-auto">
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={suggestion.id}
                    onClick={() =>
                      handleSuggestionSelect(suggestion.originalIndex)
                    }
                    className={`px-4 py-2 text-white cursor-pointer ${
                      idx === highlightedIndex
                        ? 'bg-white/20'
                        : 'hover:bg-white/20'
                    }`}
                  >
                    {suggestion.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="h-[600px] w-full mb-2">
            <CircularGallery
              ref={galleryRef}
              items={authenticatedCards}
              bend={0}
              textColor="#ffffff"
              borderRadius={0.05}
              font="bold 48px system-ui"
              scrollSpeed={2}
              scrollEase={0.3}
              onCardClick={handleClick}
              currentIndex={currentCardIndex}
              onIndexChange={setCurrentCardIndex}
            />
          </div>
          <div
            className="flex flex-col items-center w-full gap-2 z-10"
            ref={dropdownRef}
          >
            <div className="flex gap-2">
              {currentCards.map((card, index) => {
                const isCreateAvatar = card.type === 'create';
                const isSelected = currentCardIndex === index;
                return (
                  <div
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`p-0.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-110 ${
                      isSelected
                        ? 'text-white bg-white/20'
                        : 'text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                    aria-label={`Go to ${card.text}`}
                  >
                    {isCreateAvatar ? (
                      <CirclePlus className="w-2 h-2" />
                    ) : (
                      <FiCircle className="w-2 h-2" />
                    )}
                  </div>
                );
              })}
              {totalAvatarCards > CARDS_PER_PAGE && (
                <>
                  <div
                    onClick={handleNextPage}
                    className={`p-0.5 rounded-full ${
                      currentPage === totalPages - 1
                        ? 'text-white/30 cursor-not-allowed'
                        : 'text-white/50 hover:text-white hover:bg-white/10 cursor-pointer'
                    } transition-all duration-300`}
                    aria-label="Next page"
                  >
                    <FiChevronRight className="w-2 h-2" />
                  </div>
                  <div
                    onClick={handlePreviousPage}
                    className={`p-0.5 rounded-full ${
                      currentPage === 0
                        ? 'text-white/30 cursor-not-allowed'
                        : 'text-white/50 hover:text-white hover:bg-white/10 cursor-pointer'
                    } transition-all duration-300`}
                    aria-label="Previous page"
                  >
                    <FiChevronLeft className="w-2 h-2" />
                  </div>
                </>
              )}
            </div>
            <div className="min-h-[40px] w-full flex justify-center items-center gap-2">
              <button
                onClick={handleCustomizeAvatar}
                className="bg-white/10 rounded-lg border border-white/20 py-2 px-4 text-white hover:bg-white/15 transition-all duration-300 flex items-center gap-2"
              >
                {currentCardIndex === authenticatedCards.length - 1 ? (
                  <>
                    <CirclePlus className="w-5 h-5" />
                    Create Avatar
                  </>
                ) : (
                  <>
                    <UserPen className="w-5 h-5" />
                    Customize Avatar
                  </>
                )}
              </button>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="p-2 bg-white/10 hover:bg-white/10 rounded-full text-white transition focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-controls="user-menu"
              >
                <Settings className="w-6 h-6" />
              </button>
              {dropdownOpen && (
                <div
                  id="user-menu"
                  role="menu"
                  className="absolute bottom-[80px] right-0 w-48 backdrop-blur-lg bg-white/10 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                >
                  <div className="flex justify-between items-center px-4 py-2 border-b border-white/20">
                    <span className="text-white text-sm font-semibold">
                      {user?.username}
                    </span>
                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="text-white hover:text-red-500"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      onEndLiveChat?.();
                      setActiveTab('account');
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-teal-600 transition"
                    role="menuitem"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('billing');
                      onEndLiveChat?.();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-teal-600 transition"
                    role="menuitem"
                  >
                    Billing
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left flex flex-row items-center px-4 py-2 text-sm text-red-500 hover:bg-red-900 hover:text-white transition"
                    role="menuitem"
                  >
                    Logout <LogOutIcon className="ml-2 w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">{loginCard.component}</div>
      )}
    </div>
  );
};

export default AvatarSelectionComponent;
