import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-gray-100 dark:text-gray-800 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
