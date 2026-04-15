import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import TweetCard from '../components/TweetCard';
import { Image, List, Smile, Calendar, MapPin, Infinity } from 'lucide-react';
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

  const fetchAllTweets = useCallback(async () => {
    if (!contract) return;
    try {
      const total = await contract.getTotalTweets();
      const tweets = [];
      // Contracts usually don't have a "get all" if not implemented, 
      // so we iterate or use the mapping if we knew the count.
      // Based on the contract provided: mapping(uint256 => Tweet) public tweets;
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

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="flex w-full max-w-325">

        {/* Main Content Split Area */}
        <main className="flex-1 flex gap-8">

          {/* HOME LEFT: Profile Section */}
          <section className="w-1/2 border-x border-gray-800 flex flex-col h-screen overflow-y-auto scrollbar-hide">
            {/* Profile Header Mockup */}
            <div className="relative group">
              <div className="h-40 bg-gray-800 w-full" />
              <div className="absolute bottom-0 left-4">
                <Avatar size={32} />
              </div>
              <div className="p-4 flex justify-end">
                <button className="px-4 py-1.5 border border-gray-600 rounded-full font-bold hover:bg-white/10 transition-colors">
                  Edit profile
                </button>
              </div>
            </div>

            <div className="mt-5 px-4 group">
              <h3 className="text-xl font-bold">Anonymous</h3>
              <p className="text-gray-500 group-hover:hidden">{account.slice(0, 17) + "......"}</p>
              <p className="text-gray-500 hidden group-hover:block">{account}</p>
              <div className="mt-3 text-[15px]">Web 3 Twitter User</div>
              <div className="flex space-x-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>29 Feb 2026</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={16} />
                  <span>Sepolia Ethereum</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-3">
                <div className="font-bold flex items-center gap-2"><Infinity /> <span className="text-gray-500 font-normal">Following</span></div>
                <div className="font-bold flex items-center gap-2"><Infinity /> <span className="text-gray-500 font-normal">Followers</span></div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="mt-6 flex border-y border-gray-800">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-4 font-bold hover:bg-white/5 transition-colors relative ${activeTab === 'posts' ? 'text-white' : 'text-gray-500'}`}
              >
                Posts
                {activeTab === 'posts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-twitter-blue rounded-full" />}
              </button>
              <button
                onClick={() => setActiveTab('likes')}
                className={`flex-1 py-4 font-bold hover:bg-white/5 transition-colors relative ${activeTab === 'likes' ? 'text-white' : 'text-gray-500'}`}
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
                <div className="p-10 text-center text-gray-500">
                  No tweets found here yet.
                </div>
              )}
            </div>
          </section>

          {/* HOME RIGHT: Main Feed */}
          <section className="w-1/2 border-x border-gray-800 flex flex-col h-screen overflow-y-auto scrollbar-hide">
            {/* <div className="sticky top-0 bg-black/80 backdrop-blur-md p-4 flex w-full items-center justify-between z-10 border-b border-gray-800"> */}
            <div className="flex border-b border-gray-800">
              <button
                className={`flex-1 py-4 font-bold hover:bg-white/5 transition-colors relative ${true ? 'text-white' : 'text-gray-500'}`}
              >
                For You
                {true && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-twitter-blue rounded-full" />}
              </button>
              <button
                className={`flex-1 py-4 font-bold hover:bg-white/5 transition-colors relative ${false ? 'text-white' : 'text-gray-500'}`}
              >
                Following
                {false && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-twitter-blue rounded-full" />}
              </button>
            </div>
            {/* </div> */}

            {/* Tweet Input Area */}
            <div className="p-4 border-b border-gray-800 flex space-x-3">
              <Avatar size={10} />
              <div className="flex-1">
                <textarea
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  placeholder="What is happening?!"
                  className="w-full bg-transparent text-xl outline-none resize-none min-h-[70px] scrollbar-hide"
                />
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1 text-twitter-blue">
                    <div className="p-2 hover:bg-blue-400/10 rounded-full cursor-pointer"><Image size={20} /></div>
                    <div className="p-2 hover:bg-blue-400/10 rounded-full cursor-pointer"><List size={20} /></div>
                    <div className="p-2 hover:bg-blue-400/10 rounded-full cursor-pointer"><Smile size={20} /></div>
                    <div className="p-2 hover:bg-blue-400/10 rounded-full cursor-pointer opacity-50"><Calendar size={20} /></div>
                    <div className="p-2 hover:bg-blue-400/10 rounded-full cursor-pointer opacity-50"><MapPin size={20} /></div>
                  </div>
                  <button
                    onClick={handlePostTweet}
                    disabled={loading || !newTweet.trim()}
                    className="bg-twitter-blue hover:bg-twitter-blue-hover disabled:opacity-50 text-white font-bold px-5 py-2 rounded-full transition-colors"
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
            </div>
          </section>

        </main>
      </div>

      {/* Tweet Details Modal (Simple overlay) */}
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
              <div className="flex items-center justify-center space-x-3 mb-4 text-gray-500">
                by, {selectedTweet.author}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;