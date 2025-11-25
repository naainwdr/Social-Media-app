import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, Search, User, ArrowLeft, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper to get full media URL
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  if (mediaPath.startsWith('http')) return mediaPath;
  return `${API_URL}${mediaPath}`;
};

const SearchPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [followingUsers, setFollowingUsers] = useState(new Set());

  // Fetch users for search
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await api.get(`/users/search?q=${searchQuery}`);
      return response.data.data;
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Fetch recommended users (shown when no search query)
  const { data: recommendedUsers, isLoading: recommendedLoading } = useQuery({
    queryKey: ['recommendedUsers'],
    queryFn: async () => {
      const response = await api.get('/users/recommended?limit=20');
      return response.data.data;
    },
    enabled: !searchQuery.trim(),
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.post(`/users/${userId}/follow`);
      return { userId, ...response.data };
    },
    onSuccess: (data) => {
      const { userId } = data;
      setFollowingUsers(prev => new Set([...prev, userId]));
      toast.success('Successfully followed user');
      queryClient.invalidateQueries(['recommendedUsers']);
    },
    onError: (error) => {
      toast.error(error.error || 'Failed to follow user');
    },
  });

  const handleFollow = (e, userId) => {
    e.stopPropagation();
    followMutation.mutate(userId);
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const isLoading = searchQuery.trim() ? searchLoading : recommendedLoading;
  const users = searchQuery.trim() ? searchResults : recommendedUsers;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-dark-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Search</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              autoFocus
              className="w-full bg-dark-900 border border-dark-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Section Header */}
        {!searchQuery.trim() && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-300">Suggested For You</h2>
            <p className="text-sm text-gray-400">People you might want to follow</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary-500" size={40} />
          </div>
        ) : users && users.length > 0 ? (
          <div className="space-y-2">
            {users.map((user) => {
              const isFollowing = followingUsers.has(user._id);
              const isPending = followMutation.isPending && followMutation.variables === user._id;

              return (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className="flex items-center gap-4 p-4 hover:bg-dark-900 rounded-xl transition-all cursor-pointer group"
                >
                  {/* Avatar */}
                  <div className="avatar w-14 h-14 bg-dark-800 ring-2 ring-dark-700">
                    {user.avatar ? (
                      <img
                        src={getMediaUrl(user.avatar)}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-primary-500 transition-colors">
                      {user.username}
                    </h3>
                    {user.fullName && (
                      <p className="text-sm text-gray-400 truncate">{user.fullName}</p>
                    )}
                    {user.bio && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.bio}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <div className="text-xs">
                        <span className="font-semibold text-gray-300">{user.postsCount || 0}</span>
                        <span className="text-gray-500 ml-1">posts</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-gray-300">{user.followersCount || 0}</span>
                        <span className="text-gray-500 ml-1">followers</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow Button - Only show for recommended users */}
                  {!searchQuery.trim() && !isFollowing && (
                    <button
                      onClick={(e) => handleFollow(e, user._id)}
                      disabled={isPending}
                      className="btn-gradient px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                  {!searchQuery.trim() && isFollowing && (
                    <span className="text-sm text-gray-400 font-medium px-4">Following</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : searchQuery.trim() ? (
          // No search results
          <div className="text-center py-20">
            <User className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-semibold mb-2">No users found</h3>
            <p className="text-gray-400">Try searching with different keywords</p>
          </div>
        ) : (
          // No recommended users
          <div className="text-center py-20">
            <User className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-semibold mb-2">No suggestions available</h3>
            <p className="text-gray-400">Check back later for new recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;