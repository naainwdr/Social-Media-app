import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, Search, TrendingUp, Heart, MessageCircle, Play } from 'lucide-react';
import PostDetailModal from '../components/post/PostDetailModal';

// Helper to get full media URL
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  if (mediaPath.startsWith('http')) return mediaPath;
  return `${API_URL}${mediaPath}`;
};

const ExplorePage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Fetch explore posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['explorePosts'],
    queryFn: async () => {
      const response = await api.get('/posts');
      return response.data.data;
    },
  });

  // Filter posts based on search
  const filteredPosts = posts?.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.userId.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|mov|avi|webm)$/);
  };

  const getPostMedia = (post) => {
    const allMedia = post.media || [];
    
    return {
      media: allMedia,
      count: allMedia.length,
      hasMultiple: allMedia.length > 1,
      firstMedia: allMedia[0],
      isFirstVideo: allMedia[0] ? isVideo(allMedia[0]) : false
    };
  };

  const handleModalUpdate = () => {
    queryClient.invalidateQueries(['explorePosts']);
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary-500" size={24} />
            <h1 className="text-2xl font-bold">Explore</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full bg-dark-900 border border-dark-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {postsLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary-500" size={40} />
          </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {filteredPosts.map((post) => {
              const mediaInfo = getPostMedia(post);

              return (
                <div
                  key={post._id}
                  onClick={() => handlePostClick(post._id)}
                  className="relative aspect-square bg-dark-900 rounded-lg overflow-hidden cursor-pointer group"
                >
                  {mediaInfo.firstMedia ? (
                    mediaInfo.isFirstVideo ? (
                      <video
                        src={getMediaUrl(mediaInfo.firstMedia)}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={getMediaUrl(mediaInfo.firstMedia)}
                        alt="Post"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-dark-800 via-dark-900 to-black p-4 group-hover:from-dark-700 transition-all">
                      <div className="text-center space-y-2">
                        <div className="avatar w-12 h-12 bg-dark-700 mx-auto mb-3 ring-2 ring-primary-500/30">
                          {post.userId.avatar ? (
                            <img
                              src={getMediaUrl(post.userId.avatar)}
                              alt={post.userId.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {post.userId.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-primary-500">
                          @{post.userId.username}
                        </p>
                        <p className="text-gray-300 text-sm line-clamp-4 px-2">
                          {post.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Media Type Indicators */}
                  {(mediaInfo.hasMultiple || mediaInfo.isFirstVideo) && (
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {mediaInfo.hasMultiple && (
                        <div className="relative">
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-sm"></div>
                          <div className="w-4 h-4 bg-white rounded-sm"></div>
                        </div>
                      )}
                      
                      {mediaInfo.isFirstVideo && (
                        <div className="bg-black/70 backdrop-blur-sm p-1.5 rounded-full">
                          <Play size={16} className="text-white" fill="white" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                      <Heart size={24} fill="white" />
                      <span className="font-semibold">{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <MessageCircle size={24} fill="white" />
                      <span className="font-semibold">{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">
              {searchQuery ? 'No posts found' : 'No posts available'}
            </p>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onUpdate={handleModalUpdate}
        />
      )}
    </div>
  );
};

export default ExplorePage;