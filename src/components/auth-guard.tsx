// src/components/auth/AuthGuard.tsx
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  requireAuth?: boolean;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}

export function AuthGuard({
  children,
  fallback = <div className='p-4 text-center'>Please log in to continue</div>,
  loadingFallback = <div className='p-4 text-center'>Loading...</div>,
  requireAuth = true,
  isLoading = false,
  isAuthenticated = false,
}: AuthGuardProps) {
  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
