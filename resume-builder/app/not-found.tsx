import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-7xl font-bold text-[#1E3A5F] mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-6 py-3 text-sm font-medium transition-colors"
        >
          Back to {APP_NAME}
        </Link>
      </div>
    </div>
  );
}
