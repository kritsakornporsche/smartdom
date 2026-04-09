import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-9xl font-black text-white opacity-10">404</h1>
      <div className="relative -mt-20">
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">Page Not Found</h2>
        <p className="mb-8 max-w-md text-gray-400">
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition-all active:scale-95"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
