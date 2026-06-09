import { Link } from 'react-router-dom';
import { MessageSquare, Eye, ArrowUp } from 'lucide-react';
import { type Product, getInitials, getAvatarColor } from '../data/mockData';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import toast from 'react-hot-toast';

const CAT_COLORS: Record<string, string> = {
  SaaS: 'bg-blue-50 text-blue-700 border-blue-300',
  Mobile: 'bg-green-50 text-green-700 border-green-300',
  'AI/ML': 'bg-purple-50 text-purple-700 border-purple-300',
  Fintech: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  EdTech: 'bg-indigo-50 text-indigo-700 border-indigo-300',
  'E-commerce': 'bg-pink-50 text-pink-700 border-pink-300',
  Productivity: 'bg-orange-50 text-orange-700 border-orange-300',
  Design: 'bg-teal-50 text-teal-700 border-teal-300',
  'Developer Tools': 'bg-gray-50 text-gray-700 border-gray-300',
  Health: 'bg-red-50 text-red-700 border-red-300',
  Transport: 'bg-cyan-50 text-cyan-700 border-cyan-300',
  Social: 'bg-violet-50 text-violet-700 border-violet-300',
};

export default function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  const { user, isAuthenticated } = useAuthStore();
  const { toggleVote, votedProducts } = useProductStore();
  const hasVoted = user ? votedProducts.has(`${user.id}_${product.id}`) : false;

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Ovoz berish uchun kiring'); return; }
    toggleVote(product.id, user!.id);
    toast.success(hasVoted ? 'Ovoz bekor qilindi' : 'Ovoz berildi! 🎉');
  };

  const catColor = CAT_COLORS[product.category] || 'bg-paper-2 text-ink-soft border-ink-faint';

  return (
    <Link to={`/product/${product.id}`}>
      <div className="card card-hover p-4 flex items-start gap-4">
        {rank !== undefined && (
          <div className="w-5 text-center text-sm font-mono text-ink-faint mt-2 shrink-0">{rank + 1}</div>
        )}

        {/* Logo */}
        <div
          className="w-14 h-14 shrink-0 bg-accent-soft border-2 border-ink flex items-center justify-center text-accent font-scrawl font-bold text-xl"
          style={{ borderRadius: '14px 8px 16px 6px / 8px 14px 6px 16px' }}
        >
          {getInitials(product.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ink group-hover:text-accent transition-colors">{product.name}</h3>
            {product.featured && <span className="text-xs">⭐</span>}
          </div>
          <p className="text-sm text-ink-soft mt-0.5 line-clamp-1">{product.tagline}</p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`pill text-xs ${catColor}`}>{product.category}</span>
            {product.tags.slice(0, 2).map(tag => (
              <span key={tag} className="pill-ink text-xs">#{tag}</span>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-ink-faint font-mono">
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{product.commentsCount}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{product.viewsCount.toLocaleString()}</span>
            <div className="flex items-center gap-1">
              <div className={`w-4 h-4 ${getAvatarColor(product.maker.name)} rounded-full flex items-center justify-center text-white text-xs`}>
                {getInitials(product.maker.name)[0]}
              </div>
              <span className="text-ink-soft">{product.maker.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Vote button */}
        <button
          onClick={handleVote}
          className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 border-2 transition-all duration-100 ${
            hasVoted
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-ink bg-paper text-ink-soft hover:text-accent hover:border-accent'
          }`}
          style={{ borderRadius: '10px 18px 8px 14px / 16px 8px 18px 10px' }}
        >
          <ArrowUp className="w-4 h-4" />
          <span className="text-xs font-bold font-mono">{product.votesCount}</span>
        </button>
      </div>
    </Link>
  );
}
