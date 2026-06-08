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

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => { clearError(); }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signup') {
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (form.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      const ok = await signup(form.name, form.email, form.password);
      if (ok) { toast.success('Account created! Welcome!'); navigate('/'); }
    } else {
      const ok = await login(form.email, form.password);
      if (ok) { toast.success(`Welcome back!`); navigate('/'); }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">PH</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">ProductHunt UZ</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {activeTab === 'login' ? 'Sign in to discover amazing products' : 'Join the Uzbekistan tech community'}
          </p>
        </div>

        <div className="card p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['login', 'signup'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Test accounts hint */}
          {activeTab === 'login' && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Test accounts:</p>
              <p>admin@platform.uz / Admin@123456</p>
              <p>creator@platform.uz / Creator@123456</p>
              <p>user@platform.uz / User@123456</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" required className="input" placeholder="Alisher Nazarov"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" required className="input" placeholder="you@platform.uz"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required className="input pr-10"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <input type="password" required className="input" placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>
            )}
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 mt-2">
              {isLoading ? 'Please wait...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
