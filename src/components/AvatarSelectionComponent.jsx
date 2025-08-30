import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  User,
} from 'lucide-react';
import { FiCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AuthComponent from './AuthComponent';
import CreateAvatarComponent from './CreateAvatarComponent';
import AvatarCardComponent from './AvatarCardComponent';
import { useMedia } from '../context/MediaContext';

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
  const { setMessages } = useMedia();
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
  const hasInitialized = useRef(false);

  const CARDS_PER_PAGE = 3;
  const totalAvatarCards = avatars?.length || 0;
  const totalPages = Math.ceil(totalAvatarCards / CARDS_PER_PAGE);
  const startIndex = currentPage * CARDS_PER_PAGE;
  const paginatedAvatars = useMemo(
    () => avatars?.slice(startIndex, startIndex + CARDS_PER_PAGE) || [],
    [avatars, currentPage]
  );

  // Determine if we should show create avatar button on current page
  const isLastPage = currentPage === totalPages - 1;
  const shouldShowCreateAvatar = totalPages <= 1 || isLastPage;

  const isValidImageUrl = (url) => {
    if (!url) return false;
    if (url.startsWith('data:image/')) return url.includes('base64,');
    return /^(https?:\/\/|\/)/.test(url);
  };

  const clearOtherAvatarCache = (currentAvatarId) => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          (key.startsWith('avatar_icon_') ||
            key.startsWith('avatar_position_')) &&
          key !== `avatar_icon_${currentAvatarId}` &&
          key !== `avatar_position_${currentAvatarId}`
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear other avatar cache:', error);
    }
  };

  const cacheAvatarPosition = (avatarId, avatarIndex = null) => {
    try {
      localStorage.setItem('last_used_avatar_id', avatarId);

      if (avatarIndex !== null && avatars?.length > 0) {
        const positionData = {
          avatarIndex,
          page: Math.floor(avatarIndex / CARDS_PER_PAGE),
          relativeIndex: avatarIndex % CARDS_PER_PAGE,
        };
        localStorage.setItem(
          `avatar_position_${avatarId}`,
          JSON.stringify(positionData)
        );
        localStorage.setItem(
          'last_avatar_position',
          JSON.stringify(positionData)
        );
      }
    } catch (error) {
      console.error('Failed to cache avatar position:', error);
    }
  };

  const cacheAvatarIcon = (avatarId, iconUrl, avatarIndex = null) => {
    if (iconUrl) {
      try {
        clearOtherAvatarCache(avatarId);
        localStorage.setItem(`avatar_icon_${avatarId}`, iconUrl);
        localStorage.setItem('last_avatar_icon', iconUrl);
      } catch (error) {
        console.error('Failed to cache avatar icon:', error);
      }
    }
    // Always cache position regardless of icon
    cacheAvatarPosition(avatarId, avatarIndex);
  };

  // Update your handleClick function
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
          avatars?.find((avatar) => avatar.name === actualCardData.text)
            ?.avatar_id;
        if (!avatarId) {
          toast.error('Avatar ID not found');
          return;
        }

        const avatarIndex = avatars.findIndex(
          (avatar) => avatar.avatar_id === avatarId
        );
        const page = Math.floor(avatarIndex / CARDS_PER_PAGE);
        const relativeIndex = avatarIndex % CARDS_PER_PAGE;

        setCurrentPage(page);
        setCurrentCardIndex(relativeIndex);
        if (galleryRef.current) {
          galleryRef.current.setCurrentIndex(relativeIndex);
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

        if (response.data.status === 'success') {
          const selectedAvatar = avatars.find(
            (avatar) => avatar.avatar_id === avatarId
          );

          // Cache position regardless of whether there's an icon
          cacheAvatarPosition(avatarId, avatarIndex);

          // Cache icon only if it exists
          if (response.data.icon_url) {
            cacheAvatarIcon(avatarId, response.data.icon_url, avatarIndex);
          }

          const avatarWithMessages = {
            ...selectedAvatar,
            icon: response.data.icon_url || selectedAvatar?.icon,
            messages: response.data.messages || [],
          };
          setActiveAvatar(avatarWithMessages);

          if (response.data.messages) {
            setMessages((prev) => ({
              ...prev,
              [avatarId]: response.data.messages,
            }));
          }
          setActiveTab('chat');
        }
      } catch (error) {
        console.error('Error selecting avatar:', error);
        toast.error('Failed to select avatar');
      }
    } else if (actualCardData.type === 'create') {
      setShowCreateModal(true);
    }
  };

  // Update your handleCustomizeAvatar function similarly
  const handleCustomizeAvatar = async () => {
    if (currentCardIndex === authenticatedCards.length - 1) {
      setShowCreateModal(true);
      return;
    }

    const selectedCard = authenticatedCards[currentCardIndex];
    if (selectedCard.type === 'avatar') {
      try {
        const avatarId =
          selectedCard.id ||
          avatars?.find((avatar) => avatar.name === selectedCard.text)
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

        if (response.data.status === 'success') {
          const selectedAvatar = avatars.find(
            (avatar) => avatar.avatar_id === avatarId
          );

          const avatarIndex = avatars.findIndex(
            (avatar) => avatar.avatar_id === avatarId
          );

          // Cache position regardless of whether there's an icon
          cacheAvatarPosition(avatarId, avatarIndex);

          // Cache icon only if it exists
          if (response.data.icon_url) {
            cacheAvatarIcon(avatarId, response.data.icon_url, avatarIndex);
          }

          const avatarWithMessages = {
            ...selectedAvatar,
            icon: response.data.icon_url || selectedAvatar?.icon,
            messages: response.data.messages || [],
          };
          setActiveAvatar(avatarWithMessages);

          if (response.data.messages) {
            setMessages((prev) => ({
              ...prev,
              [avatarId]: response.data.messages,
            }));
          }
          setActiveTab('documents');
        }
      } catch (error) {
        console.error('Error selecting avatar for settings:', error);
        toast.error('Failed to open avatar settings');
      }
    }
  };

  const authenticatedCards = useMemo(() => {
    const avatarCards = paginatedAvatars.map((avatar) => ({
      id: avatar.avatar_id,
      component: (
        <AvatarCardComponent avatar={avatar} onCardClick={handleClick} />
      ),
      type: 'avatar',
      text: avatar.name,
      image: avatar.icon && isValidImageUrl(avatar.icon) ? avatar.icon : null,
      avatar_data: avatar,
    }));

    // Only add create avatar card if we should show it on this page
    if (shouldShowCreateAvatar) {
      avatarCards.push({
        id: 'create-avatar',
        component: <CreateAvatarComponent onCardClick={handleClick} />,
        type: 'create',
        text: 'Create Avatar',
        image: null,
      });
    }

    return avatarCards;
  }, [paginatedAvatars, shouldShowCreateAvatar]);

  const getCachedAvatarPosition = (avatarId = null) => {
    try {
      if (avatarId) {
        const cachedPosition = localStorage.getItem(
          `avatar_position_${avatarId}`
        );
        if (cachedPosition) return JSON.parse(cachedPosition);
      }
      const lastPosition = localStorage.getItem('last_avatar_position');
      if (lastPosition) return JSON.parse(lastPosition);
      return null;
    } catch (error) {
      console.error('Error getting cached avatar position:', error);
      return null;
    }
  };

  useEffect(() => {
    if (isLoggedIn && avatars?.length > 0 && !hasInitialized.current) {
      let targetIndex = 0;
      let page = 0;
      let relativeIndex = 0;

      const cachedLastAvatarId = localStorage.getItem('last_used_avatar_id');
      if (cachedLastAvatarId) {
        const cachedPosition = getCachedAvatarPosition(cachedLastAvatarId);
        if (cachedPosition && cachedPosition.avatarIndex < avatars.length) {
          targetIndex = cachedPosition.avatarIndex;
          page = cachedPosition.page;
          relativeIndex = cachedPosition.relativeIndex;
        }
      } else if (lastUsedAvatar) {
        const lastUsedIndex = avatars.findIndex(
          (avatar) => avatar.avatar_id === lastUsedAvatar
        );
        if (lastUsedIndex !== -1) {
          targetIndex = lastUsedIndex;
          page = Math.floor(targetIndex / CARDS_PER_PAGE);
          relativeIndex = targetIndex % CARDS_PER_PAGE;
        }
      }

      setCurrentPage(page);
      setCurrentCardIndex(relativeIndex);
      if (galleryRef.current) {
        galleryRef.current.setCurrentIndex(relativeIndex);
      }
      hasInitialized.current = true;
    }

    if (!isLoggedIn || !avatars?.length) {
      hasInitialized.current = false;
    }
  }, [isLoggedIn, avatars]);

  const handleLogout = () => {
    setActiveAvatar(null);
    logout();
    setDropdownOpen(false);
    onEndLiveChat?.();
  };

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

  const getLoginCardIcon = () => {
    try {
      const cachedIcon = localStorage.getItem('last_avatar_icon');
      if (cachedIcon && isValidImageUrl(cachedIcon)) return cachedIcon;
    } catch (error) {
      console.error('Error getting cached avatar icon:', error);
    }

    if (lastUsedAvatar && avatars?.length > 0) {
      const lastUsedAvatarData = avatars.find(
        (avatar) => avatar.avatar_id === lastUsedAvatar
      );
      if (
        lastUsedAvatarData?.icon &&
        isValidImageUrl(lastUsedAvatarData.icon)
      ) {
        return lastUsedAvatarData.icon;
      }
    }
    if (user?.icon && isValidImageUrl(user.icon)) return user.icon;
    return null;
  };

  const loginCard = useMemo(
    () => ({
      id: 'login',
      component: (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-16 text-center cursor-pointer hover:bg-white/10 transition-all duration-300">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
              {getLoginCardIcon() ? (
                <img
                  src={getLoginCardIcon()}
                  alt="User Icon"
                  className="w-32 h-32 object-cover rounded-full"
                  onError={(e) => {
                    console.error('Login image load failed:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-16 h-16 text-gray-400 opacity-20" />
              )}
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
      image: getLoginCardIcon(),
    }),
    [user, lastUsedAvatar, avatars]
  );

  const currentCards = isLoggedIn ? authenticatedCards : [loginCard];

  const handleDotClick = (index) => {
    setCurrentCardIndex(index);
    if (galleryRef.current) {
      galleryRef.current.setCurrentIndex(index);
    }
  };

  const handlePreviousPage = () => {
    const newPage = Math.max(currentPage - 1, 0);
    setCurrentPage(newPage);
    setCurrentCardIndex(0);
    if (galleryRef.current) {
      galleryRef.current.setCurrentIndex(0);
    }
  };

  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, totalPages - 1);
    setCurrentPage(newPage);
    setCurrentCardIndex(0);
    if (galleryRef.current) {
      galleryRef.current.setCurrentIndex(0);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setHighlightedIndex(-1);
    const allCards = [
      ...(avatars?.map((avatar, idx) => ({
        id: avatar.avatar_id,
        type: 'avatar',
        text: avatar.name,
        image: avatar.icon && isValidImageUrl(avatar.icon) ? avatar.icon : null,
        originalIndex: idx,
      })) || []),
      {
        id: 'create-avatar',
        type: 'create',
        text: 'Create Avatar',
        image: null,
        originalIndex: authenticatedCards.length - 1,
      },
    ];
    const filteredSuggestions = allCards
      .filter((card) => card.text.toLowerCase().includes(value.toLowerCase()))
      .map((card) => ({
        ...card,
        originalIndex: card.originalIndex ?? authenticatedCards.length - 1,
      }));

    setSuggestions(
      value && filteredSuggestions.length === 0
        ? [
            {
              id: 'create-avatar',
              type: 'create',
              text: 'Create Avatar',
              image: null,
              originalIndex: authenticatedCards.length - 1,
            },
          ]
        : filteredSuggestions
    );
    setIsDropdownOpen(true);
  };

  const handleSearchFocus = () => {
    const allCards = [
      ...(avatars?.map((avatar, idx) => ({
        id: avatar.avatar_id,
        type: 'avatar',
        text: avatar.name,
        image: avatar.icon && isValidImageUrl(avatar.icon) ? avatar.icon : null,
        originalIndex: idx,
      })) || []),
      {
        id: 'create-avatar',
        type: 'create',
        text: 'Create Avatar',
        image: null,
        originalIndex: authenticatedCards.length - 1,
      },
    ];
    setSuggestions(
      searchQuery &&
        allCards.every(
          (card) => !card.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
        ? [
            {
              id: 'create-avatar',
              type: 'create',
              text: 'Create Avatar',
              image: null,
              originalIndex: authenticatedCards.length - 1,
            },
          ]
        : allCards
    );
    setIsDropdownOpen(true);
  };

  const handleSuggestionSelect = (index) => {
    const avatarIndex = index;
    const page = Math.floor(avatarIndex / CARDS_PER_PAGE);
    const relativeIndex = avatarIndex % CARDS_PER_PAGE;
    setCurrentPage(page);
    setCurrentCardIndex(relativeIndex);
    if (galleryRef.current) {
      galleryRef.current.setCurrentIndex(relativeIndex);
    }
    setSearchQuery(authenticatedCards[index]?.text || '');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

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

  return (
    <div className="flex flex-col items-center justify-start p-4 relative">
      {isLoggedIn ? (
        <div className="w-full max-w-[1920px] flex flex-col items-center gap-2">
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
              {/* Show left chevron only if not on first page and pagination is used */}
              {totalAvatarCards > CARDS_PER_PAGE && currentPage > 0 && (
                <div
                  onClick={handlePreviousPage}
                  className="p-0.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-300"
                  aria-label="Previous page"
                >
                  <FiChevronLeft className="w-8 h-8" />
                </div>
              )}

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
                      <CirclePlus className="w-8 h-8" />
                    ) : (
                      <FiCircle className="w-8 h-8" />
                    )}
                  </div>
                );
              })}

              {/* Show right chevron only if not on last page and pagination is used */}
              {totalAvatarCards > CARDS_PER_PAGE &&
                currentPage < totalPages - 1 && (
                  <div
                    onClick={handleNextPage}
                    className="p-0.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-300"
                    aria-label="Next page"
                  >
                    <FiChevronRight className="w-8 h-8" />
                  </div>
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
