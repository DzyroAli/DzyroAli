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

  if (!user) return <div className="text-center py-16"><Link to="/auth" className="btn-primary">Sign In</Link></div>;

  const myProducts = products.filter(p => p.maker.id === user.id);

  const handleDeleteProduct = (id: string) => {
    if (confirm('Delete this product?')) {
      deleteProduct(id);
      toast.success('Product deleted');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(editForm);
    toast.success('Profile updated!');
  };

  const statusIcon = { pending: <Clock className="w-4 h-4 text-yellow-500" />, approved: <CheckCircle className="w-4 h-4 text-green-500" />, rejected: <XCircle className="w-4 h-4 text-red-500" /> };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 ${getAvatarColor(user.name)} rounded-2xl flex items-center justify-center text-white font-bold text-xl`}>
          {getInitials(user.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {(['products', 'settings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">My Products ({myProducts.length})</h2>
            <Link to="/create" className="btn-primary text-sm">+ New Product</Link>
          </div>
          {myProducts.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-4">You haven't submitted any products yet</p>
              <Link to="/create" className="btn-primary">Submit Your First Product</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myProducts.map(p => (
                <div key={p.id} className="card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shrink-0">
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/product/${p.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-500">{p.name}</Link>
                      {statusIcon[p.status]}
                      <span className="text-xs capitalize text-gray-400">{p.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{p.tagline}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{p.votesCount}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.viewsCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/edit/${p.id}`} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
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
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input type="text" className="input" value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea rows={3} className="input resize-none" placeholder="Tell us about yourself..."
                value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
              <input type="url" className="input" placeholder="https://yourwebsite.com"
                value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        </div>
      )}
    </div>
  );
}
