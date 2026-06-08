import { Link } from 'react-router-dom';
import { MessageSquare, Eye, ExternalLink, Star } from 'lucide-react';
import { type Product, getInitials, getAvatarColor } from '../data/mockData';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import toast from 'react-hot-toast';

const CATEGORY_COLORS: Record<string, string> = {
  SaaS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Mobile: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'AI/ML': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Fintech: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  EdTech: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'E-commerce': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Productivity: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Design: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'Developer Tools': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Social: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  Gaming: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
};

export default function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  const { user, isAuthenticated } = useAuthStore();
  const { toggleVote, votedProducts } = useProductStore();
  const hasVoted = user ? votedProducts.has(`${user.id}_${product.id}`) : false;

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Sign in to vote for products');
      return;
    }
    toggleVote(product.id, user!.id);
    toast.success(hasVoted ? 'Vote removed' : 'Voted! 🎉');
  };

  const categoryColor = CATEGORY_COLORS[product.category] || 'bg-gray-100 text-gray-700';

  return (
    <Link to={`/product/${product.id}`}>
      <div className="card p-4 flex items-start gap-4 group cursor-pointer">
        {/* Rank */}
        {rank !== undefined && (
          <div className="w-6 text-center text-sm font-bold text-gray-400 dark:text-gray-600 mt-1 shrink-0">
            {rank + 1}
          </div>
        )}

        {/* Thumbnail */}
        <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {getInitials(product.name)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                  {product.name}
                </h3>
                {product.featured && (
                  <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{product.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`badge text-xs ${categoryColor}`}>{product.category}</span>
            {product.tags.slice(0, 2).map(tag => (
              <span key={tag} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> {product.commentsCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {product.viewsCount.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <div className={`w-5 h-5 ${getAvatarColor(product.maker.name)} rounded-full flex items-center justify-center text-white text-xs`}>
                {getInitials(product.maker.name)[0]}
              </div>
              <span className="text-gray-500 dark:text-gray-400 truncate max-w-[80px]">{product.maker.name}</span>
            </div>
          </div>
        </div>

        {/* Vote button */}
        <button
          onClick={handleVote}
          className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
            hasVoted
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-500 dark:text-gray-400 hover:text-primary-500'
          }`}
        >
          <span className="text-base leading-none">{hasVoted ? '▲' : '△'}</span>
          <span className="text-xs font-bold mt-0.5">{product.votesCount}</span>
        </button>
      </div>
    </Link>
  );
}
