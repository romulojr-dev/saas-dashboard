import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import { InteractiveGridPattern } from './interactive-grid';
import { siGoogle } from "simple-icons";
import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { LoginForm } from './login-form';


export const metadata: Metadata = {
  title: 'Login',
  description: 'Authentication forms built using the components.'
};

export default function LoginViewPage() {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Login
      </Link>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-sidebar' />
        <div className='text-sidebar-foreground relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Vertise
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(500px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
            <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
              <div className="space-y-2 text-center">
                <h1 className="font-medium text-3xl">Login to your account</h1>
                <p className="text-muted-foreground text-sm">Please enter your details to login.</p>
              </div>
              <div className="space-y-4">
                <Button variant="secondary" className="w-full">
                  <SimpleIcon icon={siGoogle} className="size-4" />
                  Continue with Google
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">or continue with</span>
                </div>
                  <LoginForm />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}