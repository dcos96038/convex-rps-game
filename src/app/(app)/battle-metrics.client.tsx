'use client';

import { Preloaded, usePreloadedQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';

interface BattleMetricsProps {
  preloadedMetrics: Preloaded<typeof api.battles.getBattleMetrics>;
}

export function BattleMetrics({ preloadedMetrics }: BattleMetricsProps) {
  const metrics = usePreloadedQuery(preloadedMetrics);

  return (
    <div className='flex gap-2'>
      <Badge>Finished Battles: {metrics.finishedBattles}</Badge>
      <Badge>Total Tokens Earned: {metrics.totalTokensEarned}</Badge>
    </div>
  );
}
