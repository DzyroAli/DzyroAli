import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Github, Globe, ArrowLeft, Share2, Flag, Edit, Trash2 } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import { getInitials, getAvatarColor, MOCK_PRODUCTS } from '../data/mockData';
import CommentSection from '../components/CommentSection';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { toggleVote, votedProducts, deleteProduct } = useProductStore();
  const [product, setProduct] = useState(MOCK_PRODUCTS.find(p => p.id === id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h2>
        <Link to="/" className="btn-primary mt-4">Go Home</Link>
      </div>
    );
  }

  const hasVoted = user ? votedProducts.has(`${user.id}_${product.id}`) : false;
  const isOwner = user?.id === product.maker.id;

  const handleVote = () => {
    if (!isAuthenticated) { toast.error('Sign in to vote'); return; }
    toggleVote(product.id, user!.id);
    setProduct(prev => prev ? { ...prev, votesCount: prev.votesCount + (hasVoted ? -1 : 1) } : prev);
    toast.success(hasVoted ? 'Vote removed' : 'Voted! 🎉');
  };

  const handleDelete = () => {
    if (confirm('Delete this product?')) {
      deleteProduct(product.id);
      navigate('/');
      toast.success('Product deleted');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Link copied!'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg">
            {getInitials(product.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{product.tagline}</p>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && (
                  <>
                    <Link to={`/edit/${product.id}`} className="btn-secondary p-2">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={handleDelete} className="btn-danger p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={handleShare} className="btn-secondary p-2"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge-primary">{product.category}</span>
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">#{tag}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary py-2">
                <Globe className="w-4 h-4" /> Visit Website
              </a>
              {product.githubUrl && (
                <a href={product.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              <button
                onClick={handleVote}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  hasVoted
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{hasVoted ? '▲' : '△'}</span>
                <span>{product.votesCount} Upvotes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">About</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          <div className="card p-6">
            <CommentSection productId={product.id} currentUser={user} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Maker */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Made By</h3>
            {product.makers.map(maker => (
              <Link key={maker.id} to={`/profile/${maker.username}`} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors">
                <div className={`w-10 h-10 ${getAvatarColor(maker.name)} rounded-full flex items-center justify-center text-white font-bold`}>
                  {getInitials(maker.name)}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{maker.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@{maker.username}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Upvotes</span>
                <span className="font-semibold text-gray-900 dark:text-white">{product.votesCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Comments</span>
                <span className="font-semibold text-gray-900 dark:text-white">{product.commentsCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Views</span>
                <span className="font-semibold text-gray-900 dark:text-white">{product.viewsCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 py-2">
            <Flag className="w-4 h-4" /> Report Product
          </button>
        </div>
      </div>
    </div>
  );
}
