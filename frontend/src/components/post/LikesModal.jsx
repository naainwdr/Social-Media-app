import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  if (mediaPath.startsWith("http")) return mediaPath;
  return `${API_URL}${mediaPath}`;
};

const LikesModal = ({ isOpen, onClose, postId }) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["postLikes", postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}/likes`);
      return response.data;
    },
    enabled: isOpen && !!postId,
  });

  const users = data?.data?.users || [];

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
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No likes yet</div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className="flex items-center gap-3 p-2 hover:bg-dark-800 rounded-lg cursor-pointer transition-colors"
                >
                  {/* Avatar */}
                  <div className="avatar w-12 h-12">
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
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.username}</h3>
                    {user.fullName && (
                      <p className="text-sm text-gray-400">{user.fullName}</p>
                    )}
                  </div>
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
