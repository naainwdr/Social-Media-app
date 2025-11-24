import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StoryItem from './StoryItem';

const StoryFeed = () => {
  const { user: currentUser } = useAuth();
  
  const { data: feedData, isLoading, error } = useQuery({
    queryKey: ['storiesFeed'],
    queryFn: async () => {
      const response = await api.get('/stories/feed');
      return response.data.data;
    },
    staleTime: 60 * 1000, 
    refetchInterval: 5 * 60 * 1000, 
    enabled: !!currentUser
  });

  // 🆕 Ambil status story saya sendiri (menggunakan endpoint /my)
  const { data: myStories, isLoading: isMyStoriesLoading } = useQuery({
    queryKey: ['myStories'],
    queryFn: async () => {
        const response = await api.get('/stories/my');
        return response.data.data;
    },
    enabled: !!currentUser,
    staleTime: 60 * 1000,
  });

  const hasMyActiveStories = myStories?.length > 0;

  if (!currentUser) return null;
  if (error) return null; 

  // 1. Inisialisasi daftar feed dengan story milik sendiri (Create Button/Own Story)
  let sortedFeed = [];
  
  // Cek apakah ada story yang di-return oleh API yang merupakan milik user saat ini
  const myFeedGroup = feedData?.find(g => g.user._id === currentUser._id);
  const myHasUnviewed = myFeedGroup ? myFeedGroup.hasUnviewed : false;
  
  sortedFeed.push({
      user: currentUser,
      hasUnviewed: myHasUnviewed, 
      isOwnStory: true,
      hasActiveStories: hasMyActiveStories, // ⬅️ PASS STATUS AKTIF STORY
  });
  
  // 2. Tambahkan user yang diikuti (kecuali diri sendiri)
  const otherStories = feedData ? feedData.filter(g => g.user._id !== currentUser._id) : [];
  
  // Urutkan: Unviewed Stories (Gradient) harus tampil di depan
  const sortedOthers = [...otherStories].sort((a, b) => {
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
  });
  
  sortedFeed = sortedFeed.concat(sortedOthers);

  const isLoadingTotal = isLoading || isMyStoriesLoading;

  return (
    <div className="card p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-400 mb-3 hidden">Stories</h2>
      
      {isLoadingTotal && sortedFeed.length <= 1 ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-primary-500" size={24} />
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {sortedFeed.map((group) => (
            <StoryItem
              key={group.user._id}
              user={group.user}
              hasUnviewed={group.hasUnviewed}
              isOwnStory={group.isOwnStory}
              hasActiveStories={group.hasActiveStories}
            />
          ))}
          
          {/* Teks panduan jika hanya ada story sendiri */}
          {sortedFeed.length === 1 && sortedFeed[0].isOwnStory && (
              <p className="text-gray-500 text-sm py-4 self-center min-w-[200px]">
                Follow user lain untuk melihat story mereka
              </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryFeed;