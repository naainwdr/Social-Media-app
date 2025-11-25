import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { UserPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

// Helper to get full media URL
const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  if (mediaPath.startsWith("http")) return mediaPath;
  return `${API_URL}${mediaPath}`;
};

const RecommendedUsers = ({ limit = 5 }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [followingUsers, setFollowingUsers] = useState(new Set());

  // Get recommended users
  const { data: recommendedData, isLoading } = useQuery({
    queryKey: ["recommendedUsers", limit],
    queryFn: async () => {
      const response = await api.get(`/users/recommended?limit=${limit}`);
      return response.data.data;
    },
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.post(`/users/${userId}/follow`);
      return { userId, ...response.data };
    },
    onSuccess: (data) => {
      const { userId } = data;
      setFollowingUsers((prev) => new Set([...prev, userId]));
      toast.success("Successfully followed user");
      queryClient.invalidateQueries(["recommendedUsers"]);
    },
    onError: (error) => {
      toast.error(error.error || "Failed to follow user");
    },
  });

  const handleFollow = (userId) => {
    followMutation.mutate(userId);
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="card p-4">
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-primary-500" size={24} />
        </div>
      </div>
    );
  }

  if (!recommendedData || recommendedData.length === 0) {
    return null;
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-300">Suggested For You</h3>
      </div>

      <div className="space-y-3">
        {recommendedData.map((user) => {
          const isFollowing = followingUsers.has(user._id);
          const isPending =
            followMutation.isPending && followMutation.variables === user._id;

          return (
            <div key={user._id} className="flex items-center gap-3">
              {/* Avatar */}
              <button
                onClick={() => handleProfileClick(user._id)}
                className="flex-shrink-0"
              >
                <div className="avatar w-10 h-10">
                  {user.avatar ? (
                    <img
                      src={getMediaUrl(user.avatar)}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </button>

              {/* User Info */}
              <button
                onClick={() => handleProfileClick(user._id)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="font-semibold text-sm truncate hover:underline">
                  {user.username}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user.fullName || `${user.followersCount || 0} followers`}
                </div>
                {user.bio && (
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {user.bio}
                  </div>
                )}
              </button>

              {/* Follow Button */}
              {!isFollowing && (
                <button
                  onClick={() => handleFollow(user._id)}
                  disabled={isPending}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <span>Follow</span>
                  )}
                </button>
              )}
              {isFollowing && (
                <span className="text-xs text-gray-400 font-medium">
                  Following
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedUsers;
