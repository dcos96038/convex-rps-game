'use client';

import { Preloaded, usePreloadedQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { CoinsIcon } from 'lucide-react';

interface UserBalanceProps {
  preloadedBalance: Preloaded<typeof api.tokenTransactions.getUserBalance>;
}

export const UserBalance = ({ preloadedBalance }: UserBalanceProps) => {
  const balance = usePreloadedQuery(preloadedBalance);

  return (
    <Badge variant={'default'} className='h-full'>
      Balance: {balance} <CoinsIcon />
    </Badge>
  );
};
