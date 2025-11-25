import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { 
  Loader2, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle,
  Award,
  BarChart3,
  Flame,
  Crown,
  Eye,
  Camera
} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import PostDetailModal from '../components/post/PostDetailModal';

const DiscoverPage = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Helper to get full image URL
  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return null;
    if (mediaPath.startsWith('http')) return mediaPath;
    return `${API_URL}${mediaPath}`;
  };

  const isVideo = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.avi') || lowerUrl.endsWith('.webm');
  };

  // Get trending posts (24h)
  const { data: trendingPosts, isLoading: trendingLoading, refetch: refetchTrending } = useQuery({
    queryKey: ['analytics-trending'],
    queryFn: async () => {
      const response = await api.get('/analytics/trending');
      return response.data.data;
    },
    enabled: activeTab === 'trending',
  });

  // Get top users
  const { data: topUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['analytics-users'],
    queryFn: async () => {
      const response = await api.get('/analytics/users');
      return response.data.data;
    },
    enabled: activeTab === 'users',
  });

  // Get top posts (all time)
  const { data: topPosts, isLoading: postsLoading, refetch: refetchTopPosts } = useQuery({
    queryKey: ['analytics-posts'],
    queryFn: async () => {
      const response = await api.get('/analytics/posts');
      return response.data.data;
    },
    enabled: activeTab === 'posts',
  });

  const isLoading = trendingLoading || usersLoading || postsLoading;

  const handleOpenModal = (postId) => {
    setSelectedPostId(postId);
  };

  const handleCloseModal = () => {
    setSelectedPostId(null);
    if (activeTab === 'trending') {
      refetchTrending();
    } else if (activeTab === 'posts') {
      refetchTopPosts();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with gradient */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
            <Flame className="text-white" size={24} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-pink-500 bg-clip-text text-transparent">
            Discover
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Temukan konten dan kreator terpopuler
        </p>
      </div>

      {/* Enhanced Tabs */}
      <div className="mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'trending'
                ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/50'
                : 'bg-dark-900 text-gray-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <Flame size={20} />
            <span className="font-semibold">Trending Now</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/50'
                : 'bg-dark-900 text-gray-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <Crown size={20} />
            <span className="font-semibold">Hall of Fame</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/50'
                : 'bg-dark-900 text-gray-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <Users size={20} />
            <span className="font-semibold">Top Creators</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
          <p className="text-gray-400">Loading amazing content...</p>
        </div>
      ) : (
        <>
          {/* Trending Posts */}
          {activeTab === 'trending' && (
            <div>
              {/* Header Card */}
              <div className="card p-6 mb-6 bg-gradient-to-br from-primary-500/10 to-pink-500/10 border-primary-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
                    <Flame className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Trending Now</h2>
                    <p className="text-sm text-gray-400">
                      Hot posts dalam 24 jam terakhir
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {trendingPosts && trendingPosts.length > 0 ? (
                  trendingPosts.map((post, index) => {
                    const allMedia = post?.media || [];
                    const firstMedia = allMedia.length > 0 ? allMedia[0] : null;
                    const mediaUrl = firstMedia ? getMediaUrl(firstMedia) : null;
                    const isVideoPost = mediaUrl ? isVideo(mediaUrl) : false;

                    return (
                    <div key={post._id} className="card p-6 hover:bg-dark-800/50 transition-all">
                      <div className="flex gap-4">
                        {/* Enhanced Rank Badge */}
                        <div className="flex-shrink-0">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-dark-900' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-dark-900' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                            'bg-dark-800 text-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Link to={`/profile/${post.user?._id}`}>
                              <div className="avatar w-12 h-12 bg-dark-800 ring-2 ring-primary-500/50">
                                {post.user?.avatar ? (
                                  <img 
                                    src={getMediaUrl(post.user.avatar)} 
                                    alt={post.user.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold">
                                    {post.user?.username?.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </Link>
                            <div>
                              <Link 
                                to={`/profile/${post.user?._id}`}
                                className="font-bold hover:text-primary-500 transition-colors"
                              >
                                {post.user?.username}
                              </Link>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(post.createdAt), { 
                                  addSuffix: true,
                                  locale: id 
                                })}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>

                          {/* Media with enhanced hover */}
                          {mediaUrl && (
                            <div 
                              className="relative mb-4 cursor-pointer group overflow-hidden rounded-xl"
                              onClick={() => handleOpenModal(post._id)}
                            >
                              {isVideoPost ? (
                                <video
                                  src={`${mediaUrl}?t=${Date.now()}`}
                                  playsInline
                                  preload="metadata"
                                  className="w-full max-h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                                  onClick={(e) => e.preventDefault()}
                                />
                              ) : (
                                <img 
                                  src={mediaUrl} 
                                  alt="Post" 
                                  className="w-full max-h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                              {allMedia.length > 1 && (
                                <div className="absolute top-3 right-3 bg-dark-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                  <Camera size={14} />
                                  <span>+{allMedia.length - 1}</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                                  <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-2">
                                    <Eye size={18} className="text-white" />
                                    <span className="text-white font-semibold">View Details</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Enhanced Stats */}
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-red-400">
                              <Heart size={20} fill="currentColor" />
                              <span className="font-bold text-white">{post.recentLikesCount}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-400">
                              <MessageCircle size={20} />
                              <span className="font-bold text-white">{post.recentCommentsCount}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500/20 to-pink-500/20 px-3 py-1.5 rounded-full border border-primary-500/30">
                                <BarChart3 className="text-primary-500" size={16} />
                                <span className="font-bold text-primary-500">
                                  {post.trendingScore}
                                </span>
                                <span className="text-xs text-gray-400">score</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                )
                ) : (
                  <div className="card p-16 text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-bold mb-2">No Trending Posts Yet</h3>
                    <p className="text-gray-400">Be the first to create viral content!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hall of Fame (Top Posts All Time) */}
          {activeTab === 'posts' && (
            <div>
              <div className="card p-6 mb-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Crown className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Hall of Fame</h2>
                    <p className="text-sm text-gray-400">
                      Legendary posts sepanjang masa
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {topPosts && topPosts.length > 0 ? (
                  topPosts.map((post, index) => {
                    const allMedia = post?.media || [];
                    const firstMedia = allMedia.length > 0 ? allMedia[0] : null;
                    const mediaUrl = firstMedia ? getMediaUrl(firstMedia) : null;
                    const isVideoPost = mediaUrl ? isVideo(mediaUrl) : false;

                    return (
                    <div key={post._id} className="card p-6 hover:bg-dark-800/50 transition-all">
                      <div className="flex gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg flex-shrink-0 ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-dark-900' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-dark-900' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-dark-800 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Link to={`/profile/${post.user?._id}`}>
                              <div className="avatar w-12 h-12 bg-dark-800 ring-2 ring-yellow-500/50">
                                {post.user?.avatar ? (
                                  <img 
                                    src={getMediaUrl(post.user.avatar)} 
                                    alt={post.user.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold">
                                    {post.user?.username?.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </Link>
                            <Link 
                              to={`/profile/${post.user?._id}`}
                              className="font-bold hover:text-yellow-500 transition-colors"
                            >
                              {post.user?.username}
                            </Link>
                          </div>

                          <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>

                          {mediaUrl && (
                            <div 
                              className="relative mb-4 cursor-pointer group overflow-hidden rounded-xl"
                              onClick={() => handleOpenModal(post._id)}
                            >
                              {isVideoPost ? (
                                <video
                                  src={`${mediaUrl}?t=${Date.now()}`}
                                  playsInline
                                  preload="metadata"
                                  className="w-full max-h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                                  onClick={(e) => e.preventDefault()}
                                />
                              ) : (
                                <img 
                                  src={mediaUrl} 
                                  alt="Post" 
                                  className="w-full max-h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                              {allMedia.length > 1 && (
                                <div className="absolute top-3 right-3 bg-dark-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                  <Camera size={14} />
                                  <span>+{allMedia.length - 1}</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                                  <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-2">
                                    <Eye size={18} className="text-white" />
                                    <span className="text-white font-semibold">View Details</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-red-400">
                              <Heart size={20} fill="currentColor" />
                              <span className="font-bold text-white">{post.likesCount}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-400">
                              <MessageCircle size={20} />
                              <span className="font-bold text-white">{post.commentsCount}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
                                <Award className="text-yellow-500" size={16} />
                                <span className="font-bold text-yellow-500">
                                  {post.engagement}
                                </span>
                                <span className="text-xs text-gray-400">pts</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                )
                ) : (
                  <div className="card p-16 text-center">
                    <Crown className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-bold mb-2">Hall of Fame is Empty</h3>
                    <p className="text-gray-400">Create legendary content to be remembered!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Creators */}
          {activeTab === 'users' && (
            <div>
              <div className="card p-6 mb-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Top Creators</h2>
                    <p className="text-sm text-gray-400">
                      Kreator dengan followers terbanyak
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topUsers && topUsers.length > 0 ? (
                  topUsers.map((user, index) => (
                    <Link
                      key={user._id}
                      to={`/profile/${user._id}`}
                      className="card p-6 hover:bg-dark-800/50 transition-all hover:scale-105 transform duration-300"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-dark-900' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-dark-900' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-dark-800 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>

                        {/* Avatar with gradient ring */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full blur-sm opacity-50"></div>
                          <div className="avatar w-16 h-16 bg-dark-800 ring-2 ring-primary-500/50 relative">
                            {user.avatar ? (
                              <img 
                                src={getMediaUrl(user.avatar)} 
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{user.username}</h3>
                          {user.bio && (
                            <p className="text-sm text-gray-400 line-clamp-1">{user.bio}</p>
                          )}
                          
                          {/* Enhanced Stats */}
                          <div className="flex gap-4 mt-2 text-sm">
                            <div>
                              <span className="font-bold">{user.postsCount}</span>
                              <span className="text-gray-500 ml-1">posts</span>
                            </div>
                            <div>
                              <span className="font-bold bg-gradient-to-r from-primary-500 to-pink-500 bg-clip-text text-transparent">
                                {user.followersCount}
                              </span>
                              <span className="text-gray-500 ml-1">followers</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="card p-16 text-center col-span-2">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-bold mb-2">No Creators Yet</h3>
                    <p className="text-gray-400">Start following amazing creators!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Post Detail Modal */}
      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          onClose={handleCloseModal}
          onUpdate={handleCloseModal}
        />
      )}
    </div>
  );
};

export default DiscoverPage;