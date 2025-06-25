'use client';

import { Preloaded, usePreloadedQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

import { Coins } from 'lucide-react';
import { Challenge } from './challenge.client';
import { AuthGuard } from '@/components/auth-guard';
import { AuthModal } from '@/components/auth-modal';
import { Button } from '@/components/ui/button';

interface OpenedBattlesProps {
  preloadedBattles: Preloaded<typeof api.battles.getOpenBattles>;
  currentUser?: typeof api.auth.getCurrentUser._returnType;
}

export function OpenedBattles({
  preloadedBattles,
  currentUser,
}: OpenedBattlesProps) {
  const battles = usePreloadedQuery(preloadedBattles);

  return (
    <div className='flex flex-col w-full gap-2'>
      <span className='text-lg font-semibold'>Find your opponent</span>
      {battles.length === 0 ? (
        <div className='w-full flex justify-center items-center'>
          No opened battles found
        </div>
      ) : (
        <div className='w-full grid grid-cols-3 gap-2'>
          {battles.map(battle => (
            <div
              key={battle._id}
              className='relative w-full aspect-video rounded-xl p-2 flex flex-col overflow-hidden bg-black/50 justify-between'
            >
              <div className='flex flex-col h-full justify-between z-10'>
                <Badge variant={'default'}>
                  <Coins /> {battle.amount}
                </Badge>
                <div className='flex gap-2 justify-between'>
                  <Badge variant={'default'}>{battle.creator.email}</Badge>
                  <AuthGuard
                    isAuthenticated={!!currentUser}
                    fallback={
                      <AuthModal trigger={<Button>Challenge!</Button>} />
                    }
                  >
                    <Challenge
                      battle={battle}
                      disabled={battle.creator._id === currentUser?._id}
                    />
                  </AuthGuard>
                </div>
              </div>
              <Image
                src={battle.gifUrl ?? ''}
                alt='battle gif'
                className='absolute top-0 left-0 w-full h-full object-cover'
                fill
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
