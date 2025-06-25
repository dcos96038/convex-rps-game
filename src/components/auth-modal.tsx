'use client';

import { useState } from 'react';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AuthModalProps {
  trigger: React.ReactNode;
}

export const AuthModal = ({ trigger }: AuthModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <Tabs defaultValue='login' className='flex flex-col gap-6'>
          <TabsList>
            <TabsTrigger value='login'>Login</TabsTrigger>
            <TabsTrigger value='register'>Register</TabsTrigger>
          </TabsList>
          <TabsContent value='login' className='flex flex-col gap-6'>
            <DialogHeader>
              <DialogTitle>Login to your account</DialogTitle>
              <DialogDescription>
                Enter your email below to login to your account
              </DialogDescription>
            </DialogHeader>
            <LoginForm onSuccess={() => setIsOpen(false)} />
          </TabsContent>
          <TabsContent value='register' className='flex flex-col gap-6'>
            <DialogHeader>
              <DialogTitle>Sign up to your account</DialogTitle>
              <DialogDescription>
                Enter your email below to sign up to your account
              </DialogDescription>
            </DialogHeader>
            <RegisterForm onSuccess={() => setIsOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
