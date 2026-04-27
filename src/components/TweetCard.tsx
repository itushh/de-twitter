import { MessageCircle, Repeat2, Heart, Share, BarChart3, Bookmark, Infinity } from 'lucide-react';
import Avatar from './Avatar';
import { formatDate } from '../utils/formatDate';


interface TweetCardProps {
    tweet: {
        id: number;
        author: string;
        content: string;
        timestamp: number;
        likes: number;
    };
    onLike: (id: number) => void;
    isLiked: boolean;
    onClick?: () => void;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, onLike, isLiked, onClick }) => {
    return (
        <div
            className="p-4 border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex space-x-3">
                {/* Avatar */}
                <Avatar size={10} />

                <div className="flex-1">
                    <div className="flex gap-2 items-center space-x-1">
                        <span className="font-bold hover:underline">Anonymous</span>
                        <span className="text-gray-500">{tweet.author.slice(0, 6)}...{tweet.author.slice(-4)}</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500 text-sm">
                            {formatDate(new Date(Number(tweet.timestamp) * 1000).toLocaleDateString())}
                        </span>
                    </div>

                    <div className="mt-2 text-[15px] leading-normal whitespace-pre-wrap">
                        {tweet.content}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-gray-500 max-w-md">
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center group/icon hover:text-blue-400 transition-colors">
                            <div className="p-2 rounded-full group-hover/icon:bg-blue-400/10">
                                <MessageCircle size={18} />
                            </div>
                            <span className="text-xs"><Infinity size={18} /></span>
                        </div>

                        <div onClick={(e) => e.stopPropagation()} className="flex items-center group/icon hover:text-green-400 transition-colors">
                            <div className="p-2 rounded-full group-hover/icon:bg-green-400/10">
                                <Repeat2 size={18} />
                            </div>
                            <span className="text-xs"><Infinity size={18} /></span>
                        </div>

                        <div
                            className={`flex items-center group/icon transition-colors ${isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
                            onClick={(e) => { e.stopPropagation(); if(!isLiked) { onLike(tweet.id); } }}
                        >
                            <div className={`p-2 rounded-full ${isLiked ? '' : 'group-hover/icon:bg-pink-600/10'}`}>
                                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                            </div>
                            <span className="text-xs">{Number(tweet.likes)}</span>
                        </div>

                        <div onClick={(e) => e.stopPropagation()} className="flex items-center group/icon hover:text-blue-400 transition-colors">
                            <div className="p-2 rounded-full group-hover/icon:bg-blue-400/10">
                                <BarChart3 size={18} />
                            </div>
                            <span className="text-xs"><Infinity size={18} /></span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <div onClick={(e) => e.stopPropagation()} className="p-2 rounded-full opacity-50 hover:bg-blue-400/10 hover:text-blue-400 transition-colors">
                                <Bookmark size={18} />
                            </div>
                            <div onClick={(e) => e.stopPropagation()} className="p-2 rounded-full opacity-50 hover:bg-blue-400/10 hover:text-blue-400 transition-colors">
                                <Share size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TweetCard;
