import { useState } from 'react';
import { Heart, Reply, MoreHorizontal, Send } from 'lucide-react';
import { type Comment, type User, getInitials, getAvatarColor, MOCK_COMMENTS } from '../data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  productId: string;
  currentUser: User | null;
}

function CommentItem({ comment, currentUser, depth = 0 }: { comment: Comment; currentUser: User | null; depth?: number }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 dark:border-gray-800 pl-4' : ''}`}>
      <div className="flex gap-3 py-3">
        <div className={`w-8 h-8 shrink-0 ${getAvatarColor(comment.author.name)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
          {getInitials(comment.author.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900 dark:text-white">{comment.author.name}</span>
            <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={handleLike} className={`flex items-center gap-1 text-xs transition-colors ${ liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500' }`}>
              <Heart className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
              <span>{likesCount}</span>
            </button>
            {currentUser && depth < 2 && (
              <button onClick={() => setShowReplyInput(!showReplyInput)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors">
                <Reply className="w-3.5 h-3.5" /> Reply
              </button>
            )}
          </div>
          {showReplyInput && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="input text-sm flex-1"
              />
              <button className="btn-primary px-3 py-2 text-sm" onClick={() => { setShowReplyInput(false); setReplyText(''); }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <button className="text-gray-300 dark:text-gray-700 hover:text-gray-500 p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} currentUser={currentUser} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CommentSection({ productId, currentUser }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(
    MOCK_COMMENTS.filter(c => c.productId === productId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    const comment: Comment = {
      id: `c_${Date.now()}`,
      content: newComment,
      author: currentUser,
      productId,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Discussion ({comments.length})</h3>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <div className={`w-9 h-9 shrink-0 ${getAvatarColor(currentUser.name)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
            {getInitials(currentUser.name)}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="input text-sm flex-1"
            />
            <button type="submit" disabled={!newComment.trim()} className="btn-primary px-4 py-2">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to join the discussion</p>
        </div>
      )}

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {comments.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} currentUser={currentUser} />
          ))
        )}
      </div>
    </div>
  );
}
