import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProductPage from './pages/ProductPage';
import CreateProductPage from './pages/CreateProductPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-paper">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/create" element={<ProtectedRoute><CreateProductPage /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute><CreateProductPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '14px 8px 16px 6px / 8px 14px 6px 16px',
              border: '2px solid #29261b',
              background: '#faf8f4',
              color: '#29261b',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
          }}
        />

        <footer className="mt-20 border-t-2 border-ink py-10 bg-paper-2">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-accent border-2 border-ink flex items-center justify-center"
                    style={{ borderRadius: '14px 8px 16px 6px / 8px 14px 6px 16px' }}>
                    <span className="text-white font-scrawl font-bold text-lg leading-none">P</span>
                  </div>
                  <span className="font-scrawl font-bold text-xl text-ink">ProductHub<span className="text-accent">.uz</span></span>
                </div>
                <p className="text-sm text-ink-soft max-w-xs">O'zbekistondagi yangi mahsulotlarni har kuni kashf eting.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {[['Loyiha', ['Haqida', 'Jamoa', 'Blog']], ['Kategoriyalar', ['AI/ML', 'Fintech', 'Ta\'lim']], ['Yordam', ['FAQ', 'Qoidalar', 'Aloqa']], ['Til', ['O\'zbekcha', 'Русский', 'English']]].map(([title, links]) => (
                  <div key={title as string}>
                    <h4 className="font-semibold text-ink text-sm mb-2">{title as string}</h4>
                    {(links as string[]).map(l => <p key={l} className="text-xs text-ink-soft mt-1 hover:text-ink cursor-pointer">{l}</p>)}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-ink-faint mt-8 pt-4 flex justify-between">
              <span className="text-xs font-mono text-ink-faint">© 2026 · Toshkent</span>
              <span className="text-xs font-mono text-ink-faint">MIT License</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
