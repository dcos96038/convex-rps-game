'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Plus } from 'lucide-react';
import { useAction as useNSAction } from 'next-safe-action/hooks';

import { createBattle } from './actions';
import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function CreateBattle() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(100);
  const [move, setMove] = useState<'rock' | 'paper' | 'scissors'>('rock');
  const [isLoading, setIsLoading] = useState(false);

  const getRandomGif = useAction(api.giphy.getRandomGif);
  const { executeAsync } = useNSAction(createBattle);

  const handleCreateBattle = async () => {
    setIsLoading(true);
    const gifUrl = await getRandomGif({
      searchTerm: `${move} at rock paper scissors`,
    });
    await executeAsync({ amount, move, gifUrl });
    setIsOpen(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create a new battle
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create a new battle</DialogTitle>
          <DialogDescription>
            Create a new battle to play with your friends.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='bet' className='text-sm font-medium'>
              How much do you want to bet?
            </Label>
            <Input
              id='bet'
              defaultValue='100'
              type='number'
              onChange={e => setAmount(Number(e.target.value))}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='move' className='text-sm font-medium'>
              Choose your move
            </Label>
            <RadioGroup
              defaultValue='rock'
              onValueChange={value =>
                setMove(value as 'rock' | 'paper' | 'scissors')
              }
            >
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
        </div>
        <DialogFooter className='sm:justify-start'>
          <div className='flex flex-col gap-2 w-full'>
            <Button
              type='button'
              className='w-full'
              onClick={handleCreateBattle}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                'Create Battle'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
