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
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/create" element={
              <ProtectedRoute><CreateProductPage /></ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute><CreateProductPage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            duration: 3000,
            style: { borderRadius: '10px', fontSize: '14px' },
          }}
        />

        <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">PH</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ProductHunt Uzbekistan &copy; {new Date().getFullYear()}
                </span>
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">About</a>
                <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy</a>
                <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Terms</a>
                <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
