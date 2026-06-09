import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Trash2, Shield, Users, Package, TrendingUp, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { MOCK_USERS, getInitials, getAvatarColor } from '../data/mockData';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user } = useAuthStore();
  const { products, approveProduct, rejectProduct, deleteProduct } = useProductStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'users'>('pending');

  if (!user || user.role !== 'admin') return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <Shield className="w-16 h-16 mx-auto mb-4 text-ink-faint" />
      <h2 className="font-scrawl font-bold text-2xl text-ink mb-2">Admin huquqi kerak</h2>
      <Link to="/" className="btn-primary mt-4">Bosh sahifa</Link>
    </div>
  );

  const pending = products.filter(p => p.status === 'pending');
  const stats = [
    { label: 'Mahsulotlar', value: products.length, icon: Package },
    { label: 'Kutilmoqda', value: pending.length, icon: Clock },
    { label: 'Foydalanuvchilar', value: MOCK_USERS.length, icon: Users },
    { label: 'Ovozlar', value: products.reduce((s, p) => s + p.votesCount, 0), icon: TrendingUp },
  ];

  const displayed = activeTab === 'pending' ? pending : products;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent-soft border-2 border-ink flex items-center justify-center"
          style={{ borderRadius: '14px 8px 16px 6px / 8px 14px 6px 16px' }}>
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="font-scrawl font-bold text-2xl text-ink">Admin Panel</h1>
          <p className="text-sm text-ink-faint font-mono">Moderatsiya dasturi</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-4">
            <s.icon className="w-5 h-5 text-accent mb-2" />
            <div className="font-scrawl font-bold text-2xl text-ink">{s.value.toLocaleString()}</div>
            <div className="text-xs text-ink-soft font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 border-2 border-ink w-fit"
        style={{ borderRadius: '10px 18px 8px 14px / 16px 8px 18px 10px' }}>
        {(['pending', 'all', 'users'] as const).map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab ? 'bg-accent text-white' : 'text-ink-soft hover:text-ink hover:bg-paper-2'
            }`}
            style={i === 0 ? { borderRadius: '8px 0 0 6px' } : i === 2 ? { borderRadius: '0 16px 12px 0' } : {}}>
            {tab === 'pending' ? `Kutilmoqda (${pending.length})` : tab === 'all' ? 'Barchasi' : 'Foydalanuvchilar'}
          </button>
        ))}
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-3">
          {MOCK_USERS.map(u => (
            <div key={u.id} className="card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 ${getAvatarColor(u.name)} border-2 border-ink flex items-center justify-center text-white font-bold text-sm`}
                style={{ borderRadius: '50%' }}>
                {getInitials(u.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{u.name}</span>
                  <span className={`pill text-xs ${
                    u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-300' :
                    u.role === 'creator' ? 'pill-accent' : 'pill-ink'
                  }`}>{u.role}</span>
                </div>
                <p className="text-sm text-ink-faint font-mono">{u.email}</p>
              </div>
              <span className="text-xs font-mono text-ink-faint">{u.productsCount} ta</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.length === 0 ? (
            <div className="card p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-good" />
              <p className="font-mono text-ink-soft text-sm">Ko'rib chiqiladigan mahsulot yo'q</p>
            </div>
          ) : displayed.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-soft border-2 border-ink flex items-center justify-center text-accent font-scrawl font-bold shrink-0"
                style={{ borderRadius: '14px 8px 16px 6px / 8px 14px 6px 16px' }}>
                {getInitials(p.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{p.name}</span>
                  <span className={`pill text-xs ${
                    p.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                    p.status === 'approved' ? 'pill-good' : 'bg-red-50 text-red-700 border-red-300'
                  }`}>{p.status}</span>
                </div>
                <p className="text-sm text-ink-soft truncate">{p.tagline}</p>
                <p className="text-xs font-mono text-ink-faint">{p.maker.name} · {p.category}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Link to={`/product/${p.id}`} className="btn-ghost p-2"><Eye className="w-4 h-4" /></Link>
                {p.status === 'pending' && (
                  <>
                    <button onClick={() => { approveProduct(p.id); toast.success('Tasdiqlandi'); }} className="btn-ghost p-2 text-good hover:text-green-700">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => { rejectProduct(p.id); toast.error('Rad etildi'); }} className="btn-ghost p-2 text-yellow-600">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={() => { deleteProduct(p.id); toast.success('O\'chirildi'); }} className="btn-ghost p-2 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
