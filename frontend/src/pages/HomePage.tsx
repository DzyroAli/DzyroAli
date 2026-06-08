import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Zap, Star, ArrowRight, Rocket } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { id: 'trending' as const, label: 'Trending', icon: TrendingUp },
  { id: 'newest' as const, label: 'Newest', icon: Zap },
  { id: 'top' as const, label: 'Top', icon: Star },
];

export default function HomePage() {
  const { filteredProducts, selectedCategory, sortBy, setCategory, setSortBy, applyFilters } = useProductStore();

  useEffect(() => { applyFilters(); }, []);

  const featured = filteredProducts.filter(p => p.featured).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      {selectedCategory === 'All' && sortBy === 'trending' && (
        <div className="mb-10 text-center py-10 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white" style={{
                width: Math.random() * 80 + 20,
                height: Math.random() * 80 + 20,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: 'translate(-50%, -50%)',
              }} />
            ))}
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
              <Rocket className="w-4 h-4" /> Uzbekistan's #1 Product Platform
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Discover Amazing Products</h1>
            <p className="text-primary-100 max-w-xl mx-auto mb-6">
              Find the best new products, startups, and technologies from Uzbekistan every day.
            </p>
            <Link to="/create" className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Submit Your Product <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && selectedCategory === 'All' && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" fill="currentColor" /> Featured Today
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map(product => (
              <Link key={product.id} to={`/product/${product.id}`}
                className="card p-4 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-base mb-3">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.tagline}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{product.votesCount} votes</span>
                  <span className="badge-primary text-xs">{product.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Categories */}
        <aside className="lg:w-56 shrink-0">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Categories</h2>
          <nav className="space-y-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* Product List */}
        <main className="flex-1 min-w-0">
          {/* Sort tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    sortBy === opt.id
                      ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{filteredProducts.length} products</span>
          </div>

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
              <button onClick={() => { setCategory('All'); }} className="btn-secondary">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} rank={index} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
