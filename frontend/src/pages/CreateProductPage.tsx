import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, X, Plus, ArrowLeft } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import { CATEGORIES } from '../data/mockData';
import toast from 'react-hot-toast';

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addProduct } = useProductStore();
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', tagline: '', description: '', category: 'SaaS',
    websiteUrl: '', githubUrl: '', tags: [] as string[],
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in required</h2>
        <Link to="/auth" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.tagline || !form.description || !form.websiteUrl) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    const product = addProduct({
      ...form,
      thumbnail: '',
      featured: false,
      maker: user,
      makers: [user],
    });
    toast.success('Product submitted for review! 🎉');
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit a Product</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Share your product with the Uzbekistan tech community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input type="text" required className="input" placeholder="e.g., PaymeUZ"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tagline <span className="text-red-500">*</span>
            </label>
            <input type="text" required className="input" placeholder="A short, catchy description (max 80 chars)"
              maxLength={80} value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })} />
            <p className="text-xs text-gray-400 mt-1">{form.tagline.length}/80</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea rows={5} required className="input resize-none"
              placeholder="Describe your product in detail. What problem does it solve? Who is it for?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select className="input" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Links</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website URL <span className="text-red-500">*</span>
            </label>
            <input type="url" required className="input" placeholder="https://yourproduct.uz"
              value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL (optional)</label>
            <input type="url" className="input" placeholder="https://github.com/..."
              value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tags (up to 5)</h2>
          <div className="flex gap-2 mb-3 flex-wrap">
            {form.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 badge-primary text-sm">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" className="input text-sm" placeholder="Add a tag"
              value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
            <button type="button" onClick={addTag} className="btn-secondary px-3">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Submitting...' : 'Submit Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
