'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, PlusIcon, UserIcon } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/react';
import { addTokens } from './actions';
import { useAction as useNSAction } from 'next-safe-action/hooks';

interface UserMenuProps {
  user: NonNullable<typeof api.auth.getCurrentUser._returnType>;
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const { signOut } = useAuthActions();
  const { execute, isExecuting } = useNSAction(addTokens);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'outline'}>
          <UserIcon /> {user.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => execute({ amount: 100 })}
          disabled={isExecuting}
        >
          <PlusIcon className='w-4 h-4' />
          Add 100 tokens
          {isExecuting && <Loader2 className='w-4 h-4' />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
