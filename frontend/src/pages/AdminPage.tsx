import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Trash2, Shield, Users, Package, TrendingUp, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { MOCK_USERS, getInitials, getAvatarColor } from '../data/mockData';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user } = useAuthStore();
  const { products, approveProduct, rejectProduct, deleteProduct } = useProductStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'users'>('pending');
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Access Required</h2>
        <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const pendingProducts = products.filter(p => p.status === 'pending');
  const allProducts = products;
  const stats = [
    { label: 'Total Products', value: allProducts.length, icon: Package, color: 'text-blue-500' },
    { label: 'Pending Review', value: pendingProducts.length, icon: Clock, color: 'text-yellow-500' },
    { label: 'Total Users', value: MOCK_USERS.length, icon: Users, color: 'text-green-500' },
    { label: 'Total Votes', value: allProducts.reduce((s, p) => s + p.votesCount, 0), icon: TrendingUp, color: 'text-purple-500' },
  ];

  const displayProducts = activeTab === 'pending' ? pendingProducts : allProducts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-sm text-gray-500">Moderation dashboard</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="card p-4">
            <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {(['pending', 'all', 'users'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'
            }`}>
            {tab === 'pending' ? `Pending (${pendingProducts.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-3">
          {MOCK_USERS.map(u => (
            <div key={u.id} className="card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 ${getAvatarColor(u.name)} rounded-full flex items-center justify-center text-white font-bold`}>
                {getInitials(u.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                  <span className={`badge text-xs ${u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : u.role === 'creator' ? 'badge-primary' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <div className="text-sm text-gray-400">
                {u.productsCount} products
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayProducts.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No products to review</p>
            </div>
          ) : (
            displayProducts.map(p => (
              <div key={p.id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shrink-0">
                  {getInitials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                    <span className={`badge text-xs ${
                      p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      p.status === 'approved' ? 'badge-green' : 'bg-red-100 text-red-700'
                    }`}>{p.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{p.tagline}</p>
                  <p className="text-xs text-gray-400">by {p.maker.name} · {p.category}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/product/${p.id}`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </Link>
                  {p.status === 'pending' && (
                    <>
                      <button onClick={() => { approveProduct(p.id); toast.success('Product approved'); }}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => { rejectProduct(p.id); toast.error('Product rejected'); }}
                        className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => { deleteProduct(p.id); toast.success('Deleted'); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
