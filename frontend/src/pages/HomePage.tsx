import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Zap, Star, ArrowRight, Rocket, Flame } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';

const SORTS = [
  { id: 'trending' as const, label: 'Trend', icon: TrendingUp },
  { id: 'newest' as const, label: 'Yangi', icon: Zap },
  { id: 'top' as const, label: 'Top', icon: Star },
];

export default function HomePage() {
  const { filteredProducts, selectedCategory, sortBy, setCategory, setSortBy, applyFilters, searchQuery } = useProductStore();

  useEffect(() => { applyFilters(); }, []);

  const featured = filteredProducts.filter(p => p.featured).slice(0, 3);
  const showHero = selectedCategory === 'All' && !searchQuery;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      {showHero && (
        <div
          className="mb-10 p-8 border-2 border-ink relative overflow-hidden"
          style={{ borderRadius: '18px 10px 20px 8px / 10px 18px 8px 20px', background: '#D97757' }}
        >
          {/* Decorative dots */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-3 h-3 bg-white/20 rounded-full"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }} />
          ))}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/40 px-3 py-1 text-white text-sm font-mono mb-4"
              style={{ borderRadius: '20px 14px 18px 12px' }}>
              <Rocket className="w-3.5 h-3.5" /> O'zbekiston #1 tech platformasi
            </div>
            <h1 className="font-scrawl font-bold text-4xl sm:text-5xl text-white mb-3">
              Yangi mahsulotlar<br />kashf eting
            </h1>
            <p className="text-white/80 max-w-lg mb-6">
              Har kuni yangi startaplar — kashf eting, ovoz bering, qo'llab-quvvatlang.
            </p>
            <Link to="/create"
              className="inline-flex items-center gap-2 bg-paper border-2 border-ink text-ink font-semibold px-5 py-2.5 transition-all hover:shadow-[3px_4px_0_#29261b] hover:-translate-x-px hover:-translate-y-px"
              style={{ borderRadius: '14px 8px 16px 6px / 8px 14px 6px 16px' }}>
              Mahsulot joylash <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && showHero && (
        <div className="mb-8">
          <h2 className="font-scrawl font-bold text-2xl text-ink mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" /> Bugungi tanlanganlar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map((product, i) => (
              <Link key={product.id} to={`/product/${product.id}`}
                className={`card-${i % 2 === 0 ? '' : '2'} card-hover p-4 block`}>
                <div className="w-12 h-12 bg-accent-soft border-2 border-ink flex items-center justify-center text-accent font-scrawl font-bold text-lg mb-3"
                  style={{ borderRadius: '50% 40% 50% 40% / 40% 50% 40% 50%' }}>
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-semibold text-ink">{product.name}</h3>
                <p className="text-sm text-ink-soft mt-1 line-clamp-2">{product.tagline}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-mono text-xs text-ink-faint">▲ {product.votesCount}</span>
                  <span className="pill-accent text-xs">{product.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-48 shrink-0">
          <h2 className="font-scrawl font-bold text-xl text-ink mb-3">Kategoriyalar</h2>
          <nav className="space-y-0.5">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors rounded-sm ${
                  selectedCategory === cat
                    ? 'bg-accent-soft text-accent border-l-2 border-accent'
                    : 'text-ink-soft hover:text-ink hover:bg-paper-2'
                }`}>
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* Feed */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-paper-2 border-2 border-ink p-1"
              style={{ borderRadius: '10px 18px 8px 14px / 16px 8px 18px 10px' }}>
              {SORTS.map(s => (
                <button key={s.id} onClick={() => setSortBy(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                    sortBy === s.id
                      ? 'bg-paper border-2 border-ink text-ink'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                  style={sortBy === s.id ? { borderRadius: '8px 14px 6px 12px / 12px 6px 14px 8px' } : {}}>
                  <s.icon className="w-3.5 h-3.5" /> {s.label}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono text-ink-faint">{filteredProducts.length} ta</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="font-scrawl text-5xl text-ink-faint mb-3">¿</div>
              <p className="font-semibold text-ink mb-1">Hech narsa topilmadi</p>
              <p className="text-sm text-ink-soft mb-4">Boshqa kalit so'z sinab ko'ring</p>
              <button onClick={() => setCategory('All')} className="btn-secondary text-sm">Tozalash</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} rank={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
