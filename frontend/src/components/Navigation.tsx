import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, PlusCircle, LogOut, User, Settings, Shield, Menu, X, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { getInitials, getAvatarColor } from '../data/mockData';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setSearch } = useProductStore();
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [lang, setLang] = useState<'uz' | 'ru'>('uz');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setSearch(e.target.value);
    if (location.pathname !== '/') navigate('/');
  };

  const navLinks = [
    { to: '/', label: lang === 'uz' ? 'Asosiy' : 'Главная' },
    { to: '/categories', label: lang === 'uz' ? 'Kategoriyalar' : 'Категории' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-accent border-2 border-ink flex items-center justify-center"
              style={{ borderRadius: '14px 8px 16px 6px / 8px 14px 6px 16px' }}>
              <span className="text-white font-scrawl font-bold text-xl leading-none">P</span>
            </div>
            <span className="font-scrawl font-bold text-2xl text-ink leading-none hidden sm:block">
              ProductHub<span className="text-accent">.uz</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-2 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
              <input
                type="text"
                placeholder={lang === 'uz' ? 'Mahsulot qidirish…' : 'Поиск продуктов…'}
                value={searchValue}
                onChange={handleSearch}
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-1.5 font-medium text-sm transition-colors ${
                  location.pathname === link.to
                    ? 'text-ink border-b-2 border-accent'
                    : 'text-ink-soft hover:text-ink'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="ml-auto flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLang(l => l === 'uz' ? 'ru' : 'uz')}
              className="pill-ink flex items-center gap-1 text-xs font-mono cursor-pointer hover:bg-paper-3 transition-colors hidden sm:flex">
              <Globe className="w-3 h-3" /> {lang.toUpperCase()}
            </button>

            {isAuthenticated ? (
              <>
                <button className="btn-ghost relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent rounded-full"></span>
                </button>

                <Link to="/create" className="btn-primary py-1.5 px-3 text-sm hidden sm:inline-flex">
                  <PlusCircle className="w-4 h-4" />
                  <span>{lang === 'uz' ? 'Joylash' : 'Добавить'}</span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 hover:bg-paper-2 rounded-lg transition-colors"
                  >
                    <div className={`w-8 h-8 ${getAvatarColor(user!.name)} border-2 border-ink flex items-center justify-center text-white text-xs font-bold`}
                      style={{ borderRadius: '50% 40% 50% 40% / 40% 50% 40% 50%' }}>
                      {getInitials(user!.name)}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 card py-1 z-50 animate-fade-in">
                      <div className="px-3 py-2 border-b-2 border-ink">
                        <p className="text-sm font-semibold text-ink truncate">{user!.name}</p>
                        <p className="text-xs text-ink-faint truncate font-mono">{user!.email}</p>
                      </div>
                      <Link to={`/profile/${user!.username}`} onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-paper-2">
                        <User className="w-4 h-4" /> {lang === 'uz' ? 'Profil' : 'Профиль'}
                      </Link>
                      <Link to="/dashboard" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-paper-2">
                        <Settings className="w-4 h-4" /> Dashboard
                      </Link>
                      {user!.role === 'admin' && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-accent hover:bg-accent-soft">
                          <Shield className="w-4 h-4" /> Admin
                        </Link>
                      )}
                      <button onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                        <LogOut className="w-4 h-4" /> {lang === 'uz' ? 'Chiqish' : 'Выйти'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth" className="btn-ghost text-sm">{lang === 'uz' ? 'Kirish' : 'Войти'}</Link>
                <Link to="/auth?tab=signup" className="btn-primary py-1.5 px-3 text-sm">
                  {lang === 'uz' ? "Ro'yxat" : 'Регистрация'}
                </Link>
              </div>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden btn-ghost p-2"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 border-t-2 border-ink pt-3 animate-fade-in">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
              <input type="text" placeholder="Qidirish…" value={searchValue}
                onChange={handleSearch} className="input pl-9 py-2 text-sm" />
            </div>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setShowMobileMenu(false)}
                className="block px-2 py-2 text-sm font-medium text-ink hover:bg-paper-2 rounded">
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/create" className="btn-primary w-full justify-center mt-2" onClick={() => setShowMobileMenu(false)}>
                <PlusCircle className="w-4 h-4" /> Joylash
              </Link>
            )}
          </div>
        )}
      </div>
      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
    </nav>
  );
}
