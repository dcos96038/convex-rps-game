import { AuthGuard } from '@/components/auth-guard';
import { AuthModal } from '@/components/auth-modal';
import { SignOutButton } from '@/components/sign-out-button';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/get-current-user';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated } = await getCurrentUser();

  return (
    <div className='container mx-auto'>
      <div className='h-screen w-full flex flex-col'>
        <nav className='h-16 flex justify-between items-center'>
          <div>counters</div>
          <h1 className='scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance'>
            Rock, Paper & Scissors
          </h1>
          <AuthGuard
            isAuthenticated={isAuthenticated}
            fallback={<AuthModal trigger={<Button>Login</Button>} />}
          >
            <SignOutButton />
          </AuthGuard>
        </nav>
        <div className='flex-1 flex justify-center items-center'>
          {children}
        </div>
      </div>
    </div>
  );
}
