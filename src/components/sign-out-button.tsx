'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { Button } from './ui/button';

export const SignOutButton = () => {
  const { signOut } = useAuthActions();

  return <Button onClick={() => signOut()}>Sign out</Button>;
};
