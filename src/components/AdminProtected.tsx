'use client';

import React, { ReactNode, useEffect } from 'react';
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

  useEffect(() => {
    // If finished loading and no user or not admin -> redirect.
    if (!loading) {
      if (!user) {
        router.replace(fallbackPath);
      } else if (!isAdmin) {
        router.replace('/unauthorized'); // you can create a 403 page or change path
      }
    }
  }, [loading, user, isAdmin, router, fallbackPath]);

  // While loading, show nothing or a loader
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-white mb-4">Loading...</div>
        <div className="text-blue-400 text-sm">Checking admin permissions...</div>
      </div>
    </div>
  );

  // If user exists & isAdmin is true render children; otherwise redirect will happen
  if (user && isAdmin) return <>{children}</>;

  // fallback UI while redirecting
  return null;
}
