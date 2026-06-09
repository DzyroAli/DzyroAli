import { useState } from 'react';
import { Heart, Reply, Send } from 'lucide-react';
import { type Comment, type User, getInitials, getAvatarColor, MOCK_COMMENTS } from '../data/mockData';
import { formatDistanceToNow } from 'date-fns';

function CommentItem({ comment, currentUser, depth = 0 }: { comment: Comment; currentUser: User | null; depth?: number }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likesCount);

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-paper-3 pl-4' : ''}>
      <div className="flex gap-3 py-3">
        <div className={`w-8 h-8 shrink-0 ${getAvatarColor(comment.author.name)} border-2 border-ink flex items-center justify-center text-white text-xs font-bold`}
          style={{ borderRadius: '50% 40% 50% 40% / 40% 50% 40% 50%' }}>
          {getInitials(comment.author.name)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-ink">{comment.author.name}</span>
            <span className="text-xs font-mono text-ink-faint">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-1">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => { setLiked(!liked); setLikes(l => liked ? l - 1 : l + 1); }}
              className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-red-500' : 'text-ink-faint hover:text-red-500'}`}>
              <Heart className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} /> {likes}
            </button>
            {currentUser && depth < 2 && (
              <button onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-xs text-ink-faint hover:text-accent">
                <Reply className="w-3.5 h-3.5" /> Javob
              </button>
            )}
          </div>
          {showReply && (
            <div className="flex gap-2 mt-2">
              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Javob yozing..." className="input text-sm flex-1" />
              <button className="btn-primary px-3 py-2" onClick={() => { setShowReply(false); setReplyText(''); }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} currentUser={currentUser} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CommentSection({ productId, currentUser }: { productId: string; currentUser: User | null }) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS.filter(c => c.productId === productId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    setComments(prev => [{
      id: `c_${Date.now()}`, content: newComment, author: currentUser,
      productId, likesCount: 0, createdAt: new Date().toISOString(),
    }, ...prev]);
    setNewComment('');
  };

  return (
    <div>
      <h3 className="font-scrawl font-bold text-xl text-ink mb-4">Muhokama ({comments.length})</h3>
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <div className={`w-9 h-9 shrink-0 ${getAvatarColor(currentUser.name)} border-2 border-ink flex items-center justify-center text-white text-xs font-bold`}
            style={{ borderRadius: '50%' }}>
            {getInitials(currentUser.name)}
          </div>
          <div className="flex-1 flex gap-2">
            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Fikringizni ulashing..." className="input text-sm flex-1" />
            <button type="submit" disabled={!newComment.trim()} className="btn-primary px-4 py-2">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="border-2 border-dashed border-ink-faint p-4 text-center mb-6"
          style={{ borderRadius: '10px 18px 8px 14px / 16px 8px 18px 10px' }}>
          <p className="text-sm text-ink-soft">Fikr qoldirish uchun <a href="/auth" className="text-accent font-semibold">kiring</a></p>
        </div>
      )}
      <div className="divide-y divide-paper-3">
        {comments.length === 0 ? (
          <p className="text-center font-mono text-ink-faint py-8 text-sm">Hali fikrlar yo'q. Birinchi bo'ling!</p>
        ) : comments.map(c => <CommentItem key={c.id} comment={c} currentUser={currentUser} />)}
      </div>
    </div>
  );
}
