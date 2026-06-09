import { useParams, Link } from 'react-router-dom';
import { Globe, Twitter, Github, Users, Package, Heart, Calendar } from 'lucide-react';
import { MOCK_USERS, MOCK_PRODUCTS, getInitials, getAvatarColor } from '../data/mockData';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import ProductCard from '../components/ProductCard';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const profileUser = MOCK_USERS.find(u => u.username === username);
  const [isFollowing, setIsFollowing] = useState(false);

  if (!profileUser) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="font-scrawl text-6xl text-ink-faint mb-4">👤</div>
      <h2 className="font-scrawl font-bold text-2xl text-ink mb-4">Foydalanuvchi topilmadi</h2>
      <Link to="/" className="btn-primary">Bosh sahifa</Link>
    </div>
  );

  const userProducts = MOCK_PRODUCTS.filter(p => p.maker.id === profileUser.id);
  const isOwnProfile = currentUser?.id === profileUser.id;
  const totalVotes = userProducts.reduce((s, p) => s + p.votesCount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className={`w-20 h-20 ${getAvatarColor(profileUser.name)} border-2 border-ink flex items-center justify-center text-white font-scrawl font-bold text-3xl`}
            style={{ borderRadius: '18px 10px 20px 8px / 10px 18px 8px 20px' }}>
            {getInitials(profileUser.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-scrawl font-bold text-2xl text-ink">{profileUser.name}</h1>
                <p className="text-ink-faint font-mono text-sm">@{profileUser.username}</p>
              </div>
              {!isOwnProfile && currentUser ? (
                <button onClick={() => setIsFollowing(!isFollowing)}
                  className={isFollowing ? 'btn-secondary' : 'btn-primary'}>
                  {isFollowing ? 'Kuzatyapsiz' : 'Kuzatish'}
                </button>
              ) : isOwnProfile ? (
                <Link to="/dashboard" className="btn-secondary">Profilni tahrirlash</Link>
              ) : null}
            </div>
            {profileUser.bio && <p className="text-ink-soft mt-2">{profileUser.bio}</p>}
            <div className="flex flex-wrap gap-4 mt-3">
              {profileUser.website && (
                <a href={profileUser.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-accent hover:underline">
                  <Globe className="w-3.5 h-3.5" /> Sayt
                </a>
              )}
              {profileUser.twitter && (
                <span className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <Twitter className="w-3.5 h-3.5" /> {profileUser.twitter}
                </span>
              )}
              {profileUser.github && (
                <span className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <Github className="w-3.5 h-3.5" /> {profileUser.github}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-ink-faint font-mono">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(profileUser.createdAt).toLocaleDateString('uz', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t-2 border-ink">
          {[
            ['Mahsulotlar', userProducts.length],
            ['Ovozlar', totalVotes],
            ['Kuzatuvchilar', profileUser.followersCount + (isFollowing ? 1 : 0)],
            ['Kuzatadi', profileUser.followingCount],
          ].map(([label, value]) => (
            <div key={label} className="text-center">
              <div className="font-scrawl font-bold text-2xl text-ink">{(value as number).toLocaleString()}</div>
              <div className="text-xs text-ink-soft font-mono mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="font-scrawl font-bold text-xl text-ink mb-4">Mahsulotlar ({userProducts.length})</h2>
      {userProducts.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-ink-faint" />
          <p className="text-ink-soft font-mono text-sm">Hali mahsulot yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
