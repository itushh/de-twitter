import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import TweetCard from '../components/TweetCard';
import { Image, List, Smile, Calendar, MapPin, Infinity, Home as HomeIcon, User, LogOut } from 'lucide-react';
import Avatar from '../components/Avatar';


const Home = () => {
  const { account, contract } = useWeb3();
  const [allTweets, setAllTweets] = useState<any[]>([]);
  const [userTweets, setUserTweets] = useState<any[]>([]);
  const [likedTweets, setLikedTweets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [newTweet, setNewTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState<any | null>(null);
  const { disconnect } = useWeb3();

  const contractAddress = "0xE04922e9Fbaa53736436EF60C474546f249B714b";

  const fetchAllTweets = useCallback(async () => {
    if (!contract) return;
    try {
      const total = await contract.getTotalTweets();
      const tweets = [];
      
      for (let i = 0; i < Number(total); i++) {
        const tweet = await contract.tweets(i);
        tweets.push({
          id: Number(tweet.id),
          author: tweet.author,
          content: tweet.content,
          timestamp: Number(tweet.timestamp),
          likes: Number(tweet.likes)
        });
      }
      setAllTweets(tweets.reverse()); // Latest first
    } catch (err) {
      console.error("Error fetching all tweets:", err);
    }
  }, [contract]);

  const fetchUserData = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const uTweets = await contract.getTweetsByAuthor(account);
      const lTweets = await contract.getLikedTweets(account);

      setUserTweets([...uTweets].reverse());
      setLikedTweets([...lTweets].reverse());
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchAllTweets();
    fetchUserData();
  }, [fetchAllTweets, fetchUserData]);

  const handlePostTweet = async () => {
    if (!contract || !newTweet.trim()) return;
    setLoading(true);
    try {
      const tx = await contract.postTweet(newTweet);
      await tx.wait();
      setNewTweet('');
      fetchAllTweets();
      fetchUserData();
    } catch (err) {
      console.error("Error posting tweet:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    if (!contract) return;
    try {
      const tx = await contract.likeTweet(id);
      await tx.wait();
      fetchAllTweets();
      fetchUserData();
    } catch (err) {
      console.error("Error liking tweet:", err);
    }
  };

  // Mobile: which panel is active ('profile' | 'feed')
  const [mobilePanel, setMobilePanel] = useState<'profile' | 'feed'>('feed');

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="flex w-full max-w-7xl">

        {/* Main Content Split Area */}
        <main className="flex-1 flex gap-8">

          {/* HOME LEFT: Profile Section */}
          <section className={`
            border-x border-gray-800 flex flex-col h-screen overflow-y-auto scrollbar-hide
            w-full md:w-1/2
            ${mobilePanel === 'profile' ? 'flex' : 'hidden'} md:flex
          `}>
            {/* Profile Header */}
            <div className="relative group">
              <div className="h-32 sm:h-40 bg-gray-800 w-full" />
              <div className="absolute bottom-0 left-4">
                <div className="border-4 border-black rounded-full size-24 sm:size-40">
                  <Avatar size={"full"} />
                </div>
              </div>
              <div className="p-4 flex justify-end">
                <button onClick={() => disconnect()} className="px-4 py-1.5 flex items-center gap-2 border border-gray-600 rounded-full font-bold hover:bg-white/10 transition-colors text-sm sm:text-base">
                  <LogOut size={18} /> Log Out
                </button>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 px-4 group">
              <h3 className="text-lg sm:text-xl font-bold">Anonymous</h3>
              <p className="text-gray-500 text-sm group-hover:hidden">{account ? account.slice(0, 14) + "..." : "Connect Wallet"}</p>
              <p className="text-gray-500 text-sm hidden group-hover:block break-all">{account}</p>
              <div className="mt-3 text-[14px] sm:text-[15px]">I use dTwitter. <br /> 'cause nobody deserves to delete my tweet!</div>
              <p className="text-gray-500 mt-2 text-sm group-hover:hidden">contract : {contractAddress.slice(0, 14) + "..."}</p>
              <p className="text-gray-500 mt-2 text-sm hidden group-hover:block break-all">contract : {contractAddress}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Modern Era</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>Sepolia Ethereum</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-3 text-sm">
                <div className="font-bold flex items-center gap-1"><Infinity size={16} /> <span className="text-gray-500 font-normal">Following</span></div>
                <div className="font-bold flex items-center gap-1"><Infinity size={16} /> <span className="text-gray-500 font-normal">Followers</span></div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="mt-6 flex border-y border-gray-800">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-4 font-bold hover:bg-white/5 transition-colors relative text-sm sm:text-base ${activeTab === 'posts' ? 'text-white' : 'text-gray-500'}`}
              >
                Posts
                {activeTab === 'posts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-twitter-blue rounded-full" />}
              </button>
              <button
                onClick={() => setActiveTab('likes')}
                className={`flex-1 py-4 font-bold hover:bg-white/5 transition-colors relative text-sm sm:text-base ${activeTab === 'likes' ? 'text-white' : 'text-gray-500'}`}
              >
                Likes
                {activeTab === 'likes' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-twitter-blue rounded-full" />}
              </button>
            </div>

            {/* List of user/liked tweets */}
            <div className="flex-1">
              {(activeTab === 'posts' ? userTweets : likedTweets).map((tweet) => (
                <TweetCard
                  key={tweet.id}
                  tweet={tweet}
                  onLike={handleLike}
                  isLiked={likedTweets.some(lt => Number(lt.id) === Number(tweet.id))}
                  onClick={() => setSelectedTweet(tweet)}
                />
              ))}
              {(activeTab === 'posts' ? userTweets : likedTweets).length === 0 && (
                <div className="p-10 text-center text-gray-500 text-sm">
                  No tweets found here yet.
                </div>
              )}
            </div>
          </section>

          {/* HOME RIGHT: Main Feed */}
          <section className={`
            border-x border-gray-800 flex flex-col h-screen overflow-y-auto scrollbar-hide
            w-full md:w-1/2
            ${mobilePanel === 'feed' ? 'flex' : 'hidden'} md:flex
          `}>
            <div className="flex border-b border-gray-800">
              <button className="flex-1 py-4 font-bold hover:bg-white/5 transition-colors relative text-sm sm:text-base text-white">
                For You
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-twitter-blue rounded-full" />
              </button>
              <button className="flex-1 py-4 font-bold hover:bg-white/5 transition-colors relative text-sm sm:text-base text-gray-500">
                Following
              </button>
            </div>

            {/* Tweet Input Area */}
            <div className="p-3 sm:p-4 border-b border-gray-800 flex space-x-3">
              <Avatar size={10} />
              <div className="flex-1">
                <textarea
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  placeholder="What is happening?!"
                  className="w-full bg-transparent text-lg sm:text-xl outline-none resize-none min-h-17.5 scrollbar-hide"
                />
                <div className="flex items-center justify-between">
                  <div className="flex space-x-0 sm:space-x-1 text-twitter-blue">
                    <div className="p-1.5 sm:p-2 hover:bg-blue-400/10 rounded-full cursor-pointer"><Image size={18} /></div>
                    <div className="p-1.5 sm:p-2 hover:bg-blue-400/10 rounded-full cursor-pointer"><List size={18} /></div>
                    <div className="p-1.5 sm:p-2 hover:bg-blue-400/10 rounded-full cursor-pointer"><Smile size={18} /></div>
                    <div className="p-1.5 sm:p-2 hover:bg-blue-400/10 rounded-full cursor-pointer opacity-50 hidden sm:block"><Calendar size={18} /></div>
                    <div className="p-1.5 sm:p-2 hover:bg-blue-400/10 rounded-full cursor-pointer opacity-50 hidden sm:block"><MapPin size={18} /></div>
                  </div>
                  <button
                    onClick={handlePostTweet}
                    disabled={loading || !newTweet.trim()}
                    className="bg-twitter-blue hover:bg-twitter-blue-hover disabled:opacity-50 text-white font-bold px-4 sm:px-5 py-2 rounded-full transition-colors text-sm sm:text-base"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* All Tweets Feed */}
            <div className="flex-1">
              {allTweets.map((tweet) => (
                <TweetCard
                  key={tweet.id}
                  tweet={tweet}
                  onLike={handleLike}
                  isLiked={likedTweets.some(lt => Number(lt.id) === Number(tweet.id))}
                  onClick={() => setSelectedTweet(tweet)}
                />
              ))}
              {allTweets.length === 0 && (
                <div className="p-10 text-center text-gray-500 text-sm">
                  No tweets! Be the first to tweet here!
                </div>
              )}
            </div>
          </section>

        </main>
      </div>

      {/* Mobile Bottom Tab Bar — only visible on small screens */}
      <div className="fixed bottom-0 left-0 right-0 flex md:hidden border-t border-gray-800 bg-black z-40">
        <button
          onClick={() => setMobilePanel('feed')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition-colors ${mobilePanel === 'feed' ? 'text-twitter-blue' : 'text-gray-500'
            }`}
        >
          <HomeIcon size={22} />
          <span>Feed</span>
        </button>
        <button
          onClick={() => setMobilePanel('profile')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition-colors ${mobilePanel === 'profile' ? 'text-twitter-blue' : 'text-gray-500'
            }`}
        >
          <User size={22} />
          <span>Profile</span>
        </button>
      </div>

      {/* Tweet Details Modal */}
      {selectedTweet && (
        <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTweet(null)}>
          <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-xl">Tweet</h3>
              <button onClick={() => setSelectedTweet(null)} className="p-2 hover:bg-white/10 rounded-full">✕</button>
            </div>
            <TweetCard
              tweet={selectedTweet}
              onLike={handleLike}
              isLiked={likedTweets.some(lt => Number(lt.id) === Number(selectedTweet.id))}
            />
            <div className="p-4">
              <div className="flex items-center justify-center space-x-3 mb-4 text-gray-500 text-sm break-all">
                by {selectedTweet.author}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;