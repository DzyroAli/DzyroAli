import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Globe, Github, ArrowLeft, Share2, Flag, Edit, Trash2, ArrowUp } from 'lucide-react';
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

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!product) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="font-scrawl text-6xl text-ink-faint mb-4">¿</div>
      <h2 className="font-scrawl font-bold text-2xl text-ink mb-4">Mahsulot topilmadi</h2>
      <Link to="/" className="btn-primary">Bosh sahifa</Link>
    </div>
  );

  const hasVoted = user ? votedProducts.has(`${user.id}_${product.id}`) : false;
  const isOwner = user?.id === product.maker.id;

  const handleVote = () => {
    if (!isAuthenticated) { toast.error('Ovoz berish uchun kiring'); return; }
    toggleVote(product.id, user!.id);
    setProduct(prev => prev ? { ...prev, votesCount: prev.votesCount + (hasVoted ? -1 : 1) } : prev);
    toast.success(hasVoted ? 'Ovoz bekor qilindi' : 'Ovoz berildi! 🎉');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-6 group font-medium">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Orqaga
      </button>

      {/* Header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 bg-accent-soft border-2 border-ink flex items-center justify-center text-accent font-scrawl font-bold text-3xl shrink-0"
            style={{ borderRadius: '18px 10px 20px 8px / 10px 18px 8px 20px' }}>
            {getInitials(product.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-scrawl font-bold text-3xl text-ink">{product.name}</h1>
                <p className="text-ink-soft mt-1">{product.tagline}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isOwner && (
                  <>
                    <Link to={`/edit/${product.id}`} className="btn-ghost p-2"><Edit className="w-4 h-4" /></Link>
                    <button onClick={() => { if(confirm('O\'chirish?')) { deleteProduct(product.id); navigate('/'); toast.success('O\'chirildi'); }}} className="btn-ghost p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
                <button onClick={() => { navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Nusxa olindi!')); }} className="btn-ghost p-2">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="pill-accent">{product.category}</span>
              {product.tags.map(tag => <span key={tag} className="pill-ink">#{tag}</span>)}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn-primary py-2">
                <Globe className="w-4 h-4" /> Saytga o'tish
              </a>
              {product.githubUrl && (
                <a href={product.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              <button onClick={handleVote}
                className={`flex items-center gap-2 px-4 py-2 border-2 font-semibold transition-all ${
                  hasVoted ? 'border-accent bg-accent-soft text-accent' : 'border-ink bg-paper text-ink hover:border-accent hover:text-accent'
                }`}
                style={{ borderRadius: '10px 18px 8px 14px / 16px 8px 18px 10px' }}>
                <ArrowUp className="w-4 h-4" />
                <span>{product.votesCount} Ovoz</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-scrawl font-bold text-xl text-ink mb-3">Mahsulot haqida</h2>
            <p className="text-ink-soft leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
          <div className="card-2 p-6">
            <CommentSection productId={product.id} currentUser={user} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-scrawl font-bold text-lg text-ink mb-3">Mualliflar</h3>
            {product.makers.map(maker => (
              <Link key={maker.id} to={`/profile/${maker.username}`}
                className="flex items-center gap-3 hover:bg-paper-2 rounded-lg p-2 transition-colors">
                <div className={`w-10 h-10 ${getAvatarColor(maker.name)} border-2 border-ink flex items-center justify-center text-white font-bold text-sm`}
                  style={{ borderRadius: '50% 40% 50% 40% / 40% 50% 40% 50%' }}>
                  {getInitials(maker.name)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-ink">{maker.name}</p>
                  <p className="text-xs text-ink-faint font-mono">@{maker.username}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="card p-4">
            <h3 className="font-scrawl font-bold text-lg text-ink mb-3">Statistika</h3>
            <div className="space-y-2">
              {[['Ovozlar', product.votesCount.toLocaleString()], ['Izohlar', product.commentsCount], ['Ko\'rishlar', product.viewsCount.toLocaleString()]].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-ink-soft">{label}</span>
                  <span className="font-mono font-semibold text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 text-xs text-ink-faint hover:text-ink-soft py-2 font-mono">
            <Flag className="w-3.5 h-3.5" /> Shikoyat qilish
          </button>
        </div>
      </div>
    </div>
  );
}
