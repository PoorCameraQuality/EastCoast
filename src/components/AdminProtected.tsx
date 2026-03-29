'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AdminProtected({
  children,
  fallbackPath = '/login',
}: {
  children: ReactNode;
  fallbackPath?: string;
}) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return;
    
    // If finished loading and no user or not admin -> redirect.
    if (!loading) {
      if (!user) {
        console.log('🔒 ADMIN PROTECTED: No user, redirecting to login');
        setHasRedirected(true);
        router.replace(fallbackPath);
      } else if (!isAdmin) {
        console.log('🔒 ADMIN PROTECTED: User not admin, redirecting to unauthorized');
        setHasRedirected(true);
        router.replace('/unauthorized');
      }
    }
  }, [loading, user, isAdmin, router, fallbackPath, hasRedirected]);

  // While loading, show nothing or a loader
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-white mb-4">Loading...</div>
        <div className="text-primary-400 text-sm">Checking admin permissions...</div>
      </div>
    </div>
  );

  // If user exists & isAdmin is true render children; otherwise redirect will happen
  if (user && isAdmin) return <>{children}</>;

  // fallback UI while redirecting
  return null;
}
