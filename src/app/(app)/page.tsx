import { preloadQuery } from 'convex/nextjs';

import { api } from '../../../convex/_generated/api';
import { OpenedBattles } from './opened-battles.client';
import { FinishedBattles } from './finished-battles.client';
import { CreateBattle } from './create-battle.client';
import { AuthGuard } from '@/components/auth-guard';
import { AuthModal } from '@/components/auth-modal';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/get-current-user';

export default async function Home() {
  const { isAuthenticated, user } = await getCurrentUser();

  const preloadedOpenBattles = await preloadQuery(api.battles.getOpenBattles);

  const preloadedFinishedBattles = await preloadQuery(
    api.battles.getFinishedBattles
  );

  console.log('----->', user);

  return (
    <div className='size-full'>
      <div className='flex flex-col items-center justify-center size-full'>
        <div className='flex size-full py-2 gap-2'>
          <div className='w-full bg-accent border rounded-xl p-4 flex flex-col gap-2'>
            <OpenedBattles
              preloadedBattles={preloadedOpenBattles}
              currentUser={user}
            />
            <FinishedBattles preloadedBattles={preloadedFinishedBattles} />
          </div>
          <div className='w-1/3 flex flex-col gap-2 px-4'>
            <AuthGuard
              isAuthenticated={isAuthenticated}
              fallback={
                <AuthModal trigger={<Button>Create a battle</Button>} />
              }
            >
              <CreateBattle />
            </AuthGuard>

            <div className='flex bg-accent border rounded-xl p-4'>
              <h1>CHAT</h1>
            </div>
            <div className='flex bg-accent border rounded-xl p-4'>
              <h1>Leaderboard</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
