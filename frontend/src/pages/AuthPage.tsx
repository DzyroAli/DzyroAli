import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const { login, signup, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);
  useEffect(() => { clearError(); }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signup') {
      if (form.password !== form.confirmPassword) { toast.error('Parollar mos kelmaydi'); return; }
      const ok = await signup(form.name, form.email, form.password);
      if (ok) { toast.success('Xush kelibsiz! 🎉'); navigate('/'); }
    } else {
      const ok = await login(form.email, form.password);
      if (ok) { toast.success('Xush kelibsiz!'); navigate('/'); }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-paper">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-accent border-2 border-ink flex items-center justify-center"
              style={{ borderRadius: '14px 8px 16px 6px / 8px 14px 6px 16px' }}>
              <span className="text-white font-scrawl font-bold text-2xl leading-none">P</span>
            </div>
            <span className="font-scrawl font-bold text-3xl text-ink">ProductHub<span className="text-accent">.uz</span></span>
          </Link>
          <h1 className="font-scrawl font-bold text-2xl text-ink">
            {activeTab === 'login' ? 'Qayta xush kelibsiz' : 'Ro\'yxatdan o\'ting'}
          </h1>
          <p className="text-ink-soft text-sm mt-1">
            {activeTab === 'login' ? 'Akkauntingizga kiring' : 'O\'zbek tech jamoasiga qo\'shiling'}
          </p>
        </div>

        <div className="card p-8">
          {/* Tabs */}
          <div className="flex mb-6 border-2 border-ink"
            style={{ borderRadius: '10px 18px 8px 14px / 16px 8px 18px 10px' }}>
            {(['login', 'signup'] as const).map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-accent text-white'
                    : 'text-ink-soft hover:text-ink hover:bg-paper-2'
                }`}
                style={i === 0 ? { borderRadius: '8px 0 0 6px' } : { borderRadius: '0 16px 12px 0' }}>
                {tab === 'login' ? 'Kirish' : 'Ro\'yxat'}
              </button>
            ))}
          </div>

          {activeTab === 'login' && (
            <div className="mb-4 p-3 border border-ink-faint bg-paper-2 text-xs font-mono text-ink-soft"
              style={{ borderRadius: '8px 14px 10px 12px' }}>
              <p className="font-semibold text-ink mb-1">Test akkauntlar:</p>
              <p>admin@platform.uz / Admin@123456</p>
              <p>creator@platform.uz / Creator@123456</p>
              <p>user@platform.uz / User@123456</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 flex items-center gap-2 text-red-700 text-sm"
              style={{ borderRadius: '8px 14px 10px 12px' }}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Ism Familiya</label>
                <input type="text" required className="input" placeholder="Alisher Nazarov"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <input type="email" required className="input" placeholder="siz@platform.uz"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Parol</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required className="input pr-10"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Parolni tasdiqlang</label>
                <input type="password" required className="input" placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>
            )}
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 mt-2">
              {isLoading ? 'Kutib turing…' : (activeTab === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
