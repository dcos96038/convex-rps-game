import { AuthGuard } from '@/components/auth-guard';
import { AuthModal } from '@/components/auth-modal';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/get-current-user';
import { preloadQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';

import { Preloaded } from 'convex/react';
import { UserBalance } from './user-balance.client';
import { UserMenu } from './user-menu.client';
import { BattleMetrics } from './battle-metrics.client';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, token, user } = await getCurrentUser();

  const preloadedMetrics = await preloadQuery(api.battles.getBattleMetrics, {});

  let preloadedBalance: Preloaded<
    typeof api.tokenTransactions.getUserBalance
  > | null = null;

  if (isAuthenticated && token) {
    preloadedBalance = await preloadQuery(
      api.tokenTransactions.getUserBalance,
      {},
      { token }
    );
  }

  return (
    <div className='container mx-auto'>
      <div className='h-screen w-full flex flex-col'>
        <nav className='h-16 flex justify-between items-center'>
          <BattleMetrics preloadedMetrics={preloadedMetrics} />
          <h1 className='scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance'>
            Rock, Paper & Scissors
          </h1>
          <AuthGuard
            isAuthenticated={isAuthenticated}
            fallback={<AuthModal trigger={<Button>Login</Button>} />}
          >
            <div className='flex items-center gap-2'>
              {preloadedBalance && (
                <UserBalance preloadedBalance={preloadedBalance} />
              )}

              {user && <UserMenu user={user} />}
            </div>
          </AuthGuard>
        </nav>
        <div className='flex-1 flex justify-center items-center'>
          {children}
        </div>
      </div>
    </div>
  );
}
