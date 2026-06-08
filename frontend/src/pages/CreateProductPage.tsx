import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Plus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import { CATEGORIES } from '../data/mockData';
import toast from 'react-hot-toast';

const STEPS = ['Asoslar', 'Tafsilotlar', 'Ko\'rib chiqish'];

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addProduct } = useProductStore();
  const [step, setStep] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', tagline: '', description: '', category: 'SaaS',
    websiteUrl: '', githubUrl: '', tags: [] as string[],
  });

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="font-scrawl font-bold text-2xl mb-4">Avval kiring</h2>
      <Link to="/auth" className="btn-primary">Kirish</Link>
    </div>
  );

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.tagline || !form.description || !form.websiteUrl) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    const product = addProduct({ ...form, thumbnail: '', featured: false, maker: user, makers: [user] });
    toast.success('Mahsulot jo\'natildi! Tekshirib ko\'riladi 🚀');
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-6">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      <div className="mb-8">
        <h1 className="font-scrawl font-bold text-3xl text-ink">Mahsulot joylash</h1>
        <p className="text-ink-soft mt-1">O'zbek texnologiya jamoasi bilan ulashing</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 border-2 border-ink flex items-center justify-center text-xs font-bold transition-colors ${
              i < step ? 'bg-good text-white border-good' : i === step ? 'bg-accent text-white' : 'bg-paper text-ink-soft'
            }`} style={{ borderRadius: '50%' }}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-ink' : 'text-ink-faint'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-ink-faint mx-1" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-scrawl font-bold text-xl text-ink">Asosiy ma'lumotlar</h2>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Mahsulot nomi <span className="text-accent">*</span></label>
            <input type="text" className="input" placeholder="masalan: OsonTaxi"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Qisqa tavsif <span className="text-accent">*</span></label>
            <input type="text" className="input" placeholder="Bir jumlada nima qilasiz (max 80 belgi)"
              maxLength={80} value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })} />
            <p className="text-xs font-mono text-ink-faint mt-1">{form.tagline.length}/80</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Kategoriya</label>
            <select className="input" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Sayt manzili <span className="text-accent">*</span></label>
            <input type="url" className="input" placeholder="https://sizningmahsulot.uz"
              value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} />
          </div>
          <button onClick={() => { if (!form.name || !form.tagline || !form.websiteUrl) { toast.error('Barcha maydonlarni to\'ldiring'); return; } setStep(1); }}
            className="btn-primary w-full">Keyingi &rarr;</button>
        </div>
      )}

      {step === 1 && (
        <div className="card-2 p-6 space-y-4">
          <h2 className="font-scrawl font-bold text-xl text-ink">Batafsil ma'lumot</h2>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">To'liq tavsif <span className="text-accent">*</span></label>
            <textarea rows={5} className="input resize-none" placeholder="Mahsulot haqida batafsil yozing..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">GitHub (ixtiyoriy)</label>
            <input type="url" className="input" placeholder="https://github.com/..."
              value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Teglar (max 5)</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {form.tags.map(tag => (
                <span key={tag} className="pill-accent flex items-center gap-1">
                  #{tag}
                  <button onClick={() => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" className="input text-sm" placeholder="teg qo'shing"
                value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
              <button type="button" onClick={addTag} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary flex-1">&larr; Orqaga</button>
            <button onClick={() => { if (!form.description) { toast.error('Tavsif yozing'); return; } setStep(2); }} className="btn-primary flex-1">Keyingi &rarr;</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6">
          <h2 className="font-scrawl font-bold text-xl text-ink mb-4">Ko'rib chiqish</h2>
          <div className="bg-paper-2 border border-ink-faint p-4 mb-6 space-y-2"
            style={{ borderRadius: '10px 18px 8px 14px / 16px 8px 18px 10px' }}>
            <div><span className="text-xs font-mono text-ink-faint">Nom:</span><p className="font-semibold text-ink">{form.name}</p></div>
            <div><span className="text-xs font-mono text-ink-faint">Tavsif:</span><p className="text-ink-soft text-sm">{form.tagline}</p></div>
            <div><span className="text-xs font-mono text-ink-faint">Kategoriya:</span><span className="pill-accent text-xs ml-1">{form.category}</span></div>
            <div><span className="text-xs font-mono text-ink-faint">Teglar:</span> {form.tags.map(t => <span key={t} className="pill-ink text-xs ml-1">#{t}</span>)}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">&larr; Orqaga</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Joylanyapti...' : '🚀 Chop etish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
