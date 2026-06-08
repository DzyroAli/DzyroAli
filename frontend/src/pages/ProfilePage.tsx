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

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <Link to="/" className="btn-primary mt-4">Go Home</Link>
      </div>
    );
  }

  const userProducts = MOCK_PRODUCTS.filter(p => p.maker.id === profileUser.id);
  const isOwnProfile = currentUser?.id === profileUser.id;
  const totalVotes = userProducts.reduce((sum, p) => sum + p.votesCount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className={`w-20 h-20 ${getAvatarColor(profileUser.name)} rounded-2xl flex items-center justify-center text-white font-bold text-2xl`}>
            {getInitials(profileUser.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">@{profileUser.username}</p>
              </div>
              {!isOwnProfile && currentUser && (
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={isFollowing ? 'btn-secondary' : 'btn-primary'}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              {isOwnProfile && (
                <Link to="/dashboard" className="btn-secondary">Edit Profile</Link>
              )}
            </div>
            {profileUser.bio && (
              <p className="text-gray-600 dark:text-gray-400 mt-3">{profileUser.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-4">
              {profileUser.website && (
                <a href={profileUser.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              {profileUser.twitter && (
                <a href={`https://twitter.com/${profileUser.twitter}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600">
                  <Twitter className="w-4 h-4" /> {profileUser.twitter}
                </a>
              )}
              {profileUser.github && (
                <a href={`https://github.com/${profileUser.github}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Github className="w-4 h-4" /> {profileUser.github}
                </a>
              )}
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar className="w-4 h-4" /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: 'Products', value: userProducts.length, icon: Package },
            { label: 'Total Votes', value: totalVotes, icon: Heart },
            { label: 'Followers', value: profileUser.followersCount + (isFollowing ? 1 : 0), icon: Users },
            { label: 'Following', value: profileUser.followingCount, icon: Users },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Products ({userProducts.length})</h2>
      {userProducts.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No products yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
