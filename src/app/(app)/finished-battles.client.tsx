'use client';

import { Preloaded, usePreloadedQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import Image from 'next/image';

interface FinishedBattlesProps {
  preloadedBattles: Preloaded<typeof api.battles.getFinishedBattles>;
}

export function FinishedBattles({ preloadedBattles }: FinishedBattlesProps) {
  const battles = usePreloadedQuery(preloadedBattles);

  return (
    <div className='flex flex-col w-full gap-2'>
      <span className='text-lg font-semibold'>Finished Battles</span>
      {battles.length === 0 ? (
        <div className='w-full flex justify-center items-center'>
          No finished battles found
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
                  <Badge variant={'default'}>
                    {battle.winner._id === battle.creator?._id ? '🏆' : '💀'}{' '}
                    {battle.creator?.email}
                  </Badge>
                  <Badge variant={'default'}>
                    {battle.winner._id === battle.joiner?._id ? '🏆' : '💀'}{' '}
                    {battle.joiner?.email}
                  </Badge>
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
