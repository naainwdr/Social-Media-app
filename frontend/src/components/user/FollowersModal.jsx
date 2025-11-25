import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { X, Loader2, UserPlus, UserMinus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const FollowersModal = ({ isOpen, onClose, userId, type = 'followers' }) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(type);
  const [loadingUserId, setLoadingUserId] = useState(null);
  const queryClient = useQueryClient();

  // Gunakan userId (ID pemilik profil) dari scope modal
  const mutateUserFollowState = (targetUserId, isFollowing) => {
    // Kunci untuk mengakses data cache di mana daftar followers/following tersimpan
    const key = activeTab === 'followers' ? ['followers', userId] : ['following', userId]; 
    
    queryClient.setQueryData(key, (old) => {
      // Pastikan 'old' adalah array sebelum di-map
      if (!Array.isArray(old)) return old; 
      
      return old.map((user) =>
        // Update user yang statusnya berubah (targetUserId)
        user._id === targetUserId ? { ...user, isFollowing } : user
      );
    });
  };

  // Fetch followers
  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}/followers`);
      return response.data?.data || [];
    },
    enabled: isOpen && activeTab === 'followers',
    refetchOnWindowFocus: false, 
  });

  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}/following`);
      return response.data?.data || [];
    },
    enabled: isOpen && activeTab === 'following',
    refetchOnWindowFocus: false, 
  });

  // 🚨 PERBAIKAN 1: Redefinisi Follow mutation
  const followMutation = useMutation({
    mutationFn: async (targetUserId) => { // Menerima targetUserId
      // Menggunakan targetUserId di API endpoint
      const response = await api.post(`/users/${targetUserId}/follow`);
      return response.data; 
    },
    onSuccess: (data, targetUserId) => {
      const isNowFollowing = data.isFollowing;
      toast.success("Followed!");
      setLoadingUserId(null);
      mutateUserFollowState(targetUserId, true); 
      // Invalidate cache ProfilePage target user
      queryClient.invalidateQueries(['profile', targetUserId]);
      // Invalidate cache ProfilePage pemilik modal
      queryClient.invalidateQueries(['profile', userId]);
    },
    onError: (error, targetUserId) => { 
      toast.error(error.error || "Failed to follow");
      setLoadingUserId(null); // 🚨 FIX 4: Clear loading state on error
    },
  });

  // 🚨 PERBAIKAN 2: Redefinisi Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (targetUserId) => { // Menerima targetUserId
      // Menggunakan targetUserId di API endpoint
      const response = await api.post(`/users/${targetUserId}/follow`); 
      return response.data; 
    },
    onSuccess: (data, targetUserId) => {
      const isNowFollowing = data.isFollowing;
      toast.success("Unfollowed!");
      setLoadingUserId(null);
      mutateUserFollowState(targetUserId, false);
      // Invalidate cache ProfilePage target user
      queryClient.invalidateQueries(['profile', targetUserId]);
      // Invalidate cache ProfilePage pemilik modal
      queryClient.invalidateQueries(['profile', userId]);
    },
    onError: (error, targetUserId) => { 
      toast.error(error.error || "Failed to unfollow");
      setLoadingUserId(null); // 🚨 FIX 4: Clear loading state on error
    },
  });

  const handleFollow = (targetUserId) => {
    setLoadingUserId(targetUserId);
    followMutation.mutate(targetUserId); // Memanggil mutasi dengan ID user yang di-klik
  };

  const handleUnfollow = (targetUserId) => {
    setLoadingUserId(targetUserId);
    unfollowMutation.mutate(targetUserId); // Memanggil mutasi dengan ID user yang di-klik
  };

  if (!isOpen) return null;

  const currentData = Array.isArray(activeTab === 'followers' ? followersData : followingData)
  ? (activeTab === 'followers' ? followersData : followingData)
  : [];
  const isLoading = activeTab === 'followers' ? followersLoading : followingLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-dark-900 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800">
          <div className="flex gap-4 flex-1">
            <button
              onClick={() => setActiveTab('followers')}
              className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                activeTab === 'followers'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400'
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                activeTab === 'following'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400'
              }`}
            >
              Following
            </button>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-dark-800 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
          ) : currentData && currentData.length > 0 ? (
            <div className="space-y-3">
              {currentData.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-3 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  {/* Avatar */}
                  <Link
                    to={`/profile/${user._id}`}
                    onClick={onClose}
                    className="avatar w-12 h-12 bg-gradient-instagram flex-shrink-0"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Link>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{user.username}</h3>
                    {user.bio && (
                      <p className="text-sm text-gray-400 truncate">{user.bio}</p>
                    )}
                  </div>

                  {/* Follow/Unfollow Button */}
                  {user._id !== currentUser?._id && (
                    <div>
                      {user.isFollowing ? (
                        <button
                          onClick={() => handleUnfollow(user._id)}
                          disabled={loadingUserId === user._id || unfollowMutation.isPending}
                          className="px-3 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-300 flex items-center gap-1 font-semibold"
                        >
                          {loadingUserId === user._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <UserMinus size={14} />
                          )}
                          Unfollow
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(user._id)}
                          disabled={loadingUserId === user._id || followMutation.isPending}
                          className="px-3 py-1 text-xs bg-primary-500 hover:bg-primary-600 rounded-lg text-white flex items-center gap-1 font-semibold"
                        >
                          {loadingUserId === user._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <UserPlus size={14} />
                          )}
                          Follow
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;