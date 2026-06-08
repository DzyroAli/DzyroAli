import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, Edit, Trash2, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { getInitials, getAvatarColor } from '../data/mockData';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, updateUser } = useAuthStore();
  const { products, deleteProduct } = useProductStore();
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [editForm, setEditForm] = useState({ name: user?.name || '', bio: user?.bio || '', website: user?.website || '' });

  if (!user) return <div className="text-center py-16"><Link to="/auth" className="btn-primary">Kirish</Link></div>;

  const myProducts = products.filter(p => p.maker.id === user.id);
  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    approved: <CheckCircle className="w-4 h-4 text-good" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 ${getAvatarColor(user.name)} border-2 border-ink flex items-center justify-center text-white font-scrawl font-bold text-2xl`}
          style={{ borderRadius: '18px 10px 20px 8px / 10px 18px 8px 20px' }}>
          {getInitials(user.name)}
        </div>
        <div>
          <h1 className="font-scrawl font-bold text-2xl text-ink">{user.name}</h1>
          <p className="text-ink-faint font-mono text-sm">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-2 border-ink w-fit"
        style={{ borderRadius: '10px 18px 8px 14px / 16px 8px 18px 10px' }}>
        {(['products', 'settings'] as const).map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab ? 'bg-accent text-white' : 'text-ink-soft hover:text-ink hover:bg-paper-2'
            }`}
            style={i === 0 ? { borderRadius: '8px 0 0 6px' } : { borderRadius: '0 16px 12px 0' }}>
            {tab === 'products' ? 'Mahsulotlarim' : 'Sozlamalar'}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-ink">Mahsulotlarim ({myProducts.length})</h2>
            <Link to="/create" className="btn-primary text-sm">+ Yangi</Link>
          </div>
          {myProducts.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-ink-faint" />
              <p className="text-ink-soft mb-4 font-mono text-sm">Hali mahsulot yo'q</p>
              <Link to="/create" className="btn-primary">Birinchi mahsulotni joylang</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myProducts.map(p => (
                <div key={p.id} className="card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-soft border-2 border-ink flex items-center justify-center text-accent font-scrawl font-bold shrink-0"
                    style={{ borderRadius: '14px 8px 16px 6px / 8px 14px 6px 16px' }}>
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/product/${p.id}`} className="font-semibold text-ink hover:text-accent">{p.name}</Link>
                      {statusIcon[p.status]}
                    </div>
                    <p className="text-sm text-ink-soft truncate">{p.tagline}</p>
                    <div className="flex gap-3 mt-1 text-xs font-mono text-ink-faint">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{p.votesCount}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.viewsCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/edit/${p.id}`} className="btn-ghost p-2"><Edit className="w-4 h-4" /></Link>
                    <button onClick={() => { if (confirm('O\'chirish?')) { deleteProduct(p.id); toast.success('O\'chirildi'); }}} className="btn-ghost p-2 text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card p-6">
          <h2 className="font-scrawl font-bold text-xl text-ink mb-6">Profil sozlamalari</h2>
          <form onSubmit={e => { e.preventDefault(); updateUser(editForm); toast.success('Saqlandi!'); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Ism</label>
              <input type="text" className="input" value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Bio</label>
              <textarea rows={3} className="input resize-none" placeholder="O'zingiz haqingizda..."
                value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Sayt</label>
              <input type="url" className="input" placeholder="https://sizningsayt.uz"
                value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary">Saqlash</button>
          </form>
        </div>
      )}
    </div>
  );
}
