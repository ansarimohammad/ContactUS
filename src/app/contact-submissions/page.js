'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactSubmissions() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin version
    router.replace('/admin/contact-submissions');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to admin panel...</p>
      </div>
    </div>
  );
} 