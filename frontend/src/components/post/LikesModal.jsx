import { useState } from "react";
import { X, Loader2, UserPlus, UserMinus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  if (mediaPath.startsWith("http")) return mediaPath;
  return `${API_URL}${mediaPath}`;
};

const LikesModal = ({ isOpen, onClose, postId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [loadingUserId, setLoadingUserId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["postLikes", postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}/likes`);
      return response.data?.data?.users || [];
    },
    enabled: isOpen && !!postId,
    staleTime: 1000 * 60,
  });

  const users = Array.isArray(data) ? data : [];

  // Mutate follow/unfollow state locally
  const mutateUserFollowState = (userId, isFollowing) => {
    queryClient.setQueryData(["postLikes", postId], (old) => {
      if (!Array.isArray(old)) return old;
      return old.map((user) =>
        user._id === userId ? { ...user, isFollowing } : user
      );
    });
  };

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (userId) => {
      await api.post(`/users/${userId}/follow`);
    },
    onSuccess: (_, userId) => {
      toast.success("Followed!");
      setLoadingUserId(null);
      mutateUserFollowState(userId, true); // ✅ update local state
    },
    onError: () => {
      toast.error("Failed to follow");
      setLoadingUserId(null);
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (userId) => {
      await api.post(`/users/${userId}/follow`);
    },
    onSuccess: (_, userId) => {
      toast.success("Unfollowed!");
      setLoadingUserId(null);
      mutateUserFollowState(userId, false); // ✅ update local state
    },
    onError: () => {
      toast.error("Failed to unfollow");
      setLoadingUserId(null);
    },
  });

  const handleFollow = (userId) => {
    setLoadingUserId(userId);
    followMutation.mutate(userId);
  };

  const handleUnfollow = (userId) => {
    setLoadingUserId(userId);
    unfollowMutation.mutate(userId);
  };

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800">
          <h2 className="text-lg font-semibold">Likes</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-400">
              Error loading likes
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No likes yet</div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-2 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className="avatar w-12 h-12 cursor-pointer"
                    onClick={() => handleUserClick(user._id)}
                  >
                    {user.avatar ? (
                      <img
                        src={getMediaUrl(user.avatar)}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 cursor-pointer" onClick={() => handleUserClick(user._id)}>
                    <h3 className="font-semibold">{user.username}</h3>
                    {user.fullName && (
                      <p className="text-sm text-gray-400">{user.fullName}</p>
                    )}
                    {/* Tampilkan waktu like */}
                    {user.likedAt && (
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(user.likedAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>

                  {/* Follow/Unfollow Button */}
                  {user._id !== currentUser?._id && (
                    <div>
                      {user.isFollowing ? (
                        <button
                          onClick={() => handleUnfollow(user._id)}
                          disabled={loadingUserId === user._id}
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
                          disabled={loadingUserId === user._id}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default LikesModal;
