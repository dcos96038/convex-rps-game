'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { useAuthActions } from '@convex-dev/auth/react';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { signIn } = useAuthActions();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setLoading(true);

    await signIn('password', {
      email,
      password,
      flow: 'signIn',
    });

    onSuccess();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6 w-full'>
      <div className='flex flex-col gap-6'>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='my-email@example.com'
            required
          />
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center'>
            <Label htmlFor='password'>Password</Label>
          </div>
          <Input id='password' name='password' type='password' required />
        </div>
      </div>
      <Button type='submit' className='w-full' disabled={loading}>
        {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Login'}
      </Button>
    </form>
  );
};
