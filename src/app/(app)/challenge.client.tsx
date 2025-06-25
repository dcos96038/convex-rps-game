'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Label } from '@radix-ui/react-label';
import { useState } from 'react';
import { useAction as useNSAction } from 'next-safe-action/hooks';
import { challengeBattle } from './actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ChallengeModalProps {
  battle: (typeof api.battles.getOpenBattles._returnType)[number];
  disabled?: boolean;
}

export function Challenge({ battle, disabled = false }: ChallengeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { executeAsync, isExecuting } = useNSAction(challengeBattle);

  const handleChallenge = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const move = formData.get('move') as 'rock' | 'paper' | 'scissors';

    setIsLoading(true);
    await executeAsync({ battleId: battle._id, move });
    setIsOpen(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} type='button' variant='outline'>
          Challenge!
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleChallenge}>
          <DialogHeader>
            <DialogTitle>Challenge {battle.createdBy}</DialogTitle>
            <DialogDescription>
              You are about to challenge {battle.createdBy} to a battle of{' '}
              {battle.amount} coins.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='move' className='text-sm font-medium'>
              Choose your move
            </Label>
            <RadioGroup defaultValue='rock' name='move' required>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='rock' id='rock' />
                <Label htmlFor='rock'>Rock</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='paper' id='paper' />
                <Label htmlFor='paper'>Paper</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='scissors' id='scissors' />
                <Label htmlFor='scissors'>Scissors</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline' type='button'>
                Cancel
              </Button>
            </DialogClose>
            <Button type='submit' disabled={isExecuting || isLoading}>
              Challenge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
