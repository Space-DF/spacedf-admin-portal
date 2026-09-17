'use client';

import { Eye, LockKeyhole, type LucideIcon, Mail, User } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { AppleIcon, GoogleIcon, SpaceDFLogoFull } from '@/components/icons';

interface ScreenContext {
  headingText: string;
  supportText?: string;
}

export const AuthLogo = ({
  show,
  logoUrl,
}: {
  show: boolean;
  logoUrl?: string | null;
}) => {
  if (!show) return null;

  return (
    <div className='mb-6 flex justify-center'>
      {logoUrl ? (
        <Image
          src={logoUrl}
          width={140}
          height={32}
          alt='Logo'
          unoptimized
          className='h-8 w-auto object-contain'
        />
      ) : (
        <SpaceDFLogoFull width={132} height={26} className='text-black' />
      )}
    </div>
  );
};

const MockField = ({
  icon: Icon,
  label,
  placeholder,
  withReveal,
}: {
  icon: LucideIcon;
  label: string;
  placeholder: string;
  withReveal?: boolean;
}) => (
  <div className='space-y-1.5 text-left'>
    <p className='text-xs font-medium text-[--support-text-color]'>{label}</p>
    <div className='flex h-9 items-center gap-2 rounded-[--input-border-radius] border border-[--input-border-color] bg-[--input-color] px-3'>
      <Icon size={16} className='shrink-0 text-[--support-text-color]' />
      <span className='flex-1 truncate text-sm text-[--support-text-color]'>
        {placeholder}
      </span>
      {withReveal && (
        <Eye size={16} className='shrink-0 text-[--support-text-color]' />
      )}
    </div>
  </div>
);

const MockButton = ({
  children,
  variant = 'primary',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
}) => (
  <div
    className={cn(
      'flex h-10 w-full items-center justify-center gap-2 rounded-[--button-border-radius] text-sm font-semibold',
      variant === 'primary'
        ? 'bg-[--primary-color] text-[--primary-text-color]'
        : 'border border-[--border-color] bg-[--secondary-color] text-[--secondary-text-color]',
    )}
  >
    {children}
  </div>
);

const ScreenHeading = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <div className='mb-6 space-y-2 text-center'>
    <p className='text-lg font-semibold text-[--text-color]'>{title}</p>
    {description && (
      <p className='text-xs text-[--support-text-color]'>{description}</p>
    )}
  </div>
);

const FooterNote = ({ children }: { children: React.ReactNode }) => (
  <p className='mt-4 text-center text-xs font-semibold text-[--support-text-color]'>
    {children}
  </p>
);

export const SignInScreen = ({ headingText, supportText }: ScreenContext) => (
  <div className='w-full max-w-md'>
    <ScreenHeading title={headingText} description={supportText} />
    <div className='space-y-2'>
      <p className='text-xs font-semibold text-[--text-color]'>
        Sign in with social account
      </p>
      <MockButton variant='outline'>
        <GoogleIcon />
        Continue with Google
      </MockButton>
      <MockButton>
        <AppleIcon />
        Continue with Apple
      </MockButton>
    </div>
    <div className='my-4 h-px w-full bg-[--border-color]' />
    <div className='space-y-3'>
      <MockField icon={Mail} label='Email' placeholder='Email' />
      <MockField
        icon={LockKeyhole}
        label='Password'
        placeholder='Password'
        withReveal
      />
    </div>
    <div className='mb-4 mt-4 flex justify-end'>
      <span className='text-xs font-medium text-[--text-color]'>
        Forgot password?
      </span>
    </div>
    <MockButton>Sign in</MockButton>
    <FooterNote>
      Don&apos;t have an account?{' '}
      <span className='font-semibold text-[--text-color]'>Sign up</span>
    </FooterNote>
  </div>
);

export const SignUpScreen = ({ headingText, supportText }: ScreenContext) => (
  <div className='w-full max-w-md'>
    <ScreenHeading title={headingText} description={supportText} />
    <div className='space-y-2'>
      <p className='text-xs font-semibold text-[--text-color]'>
        Continue with social account
      </p>
      <MockButton variant='outline'>
        <GoogleIcon />
        Continue with Google
      </MockButton>
      <MockButton>
        <AppleIcon />
        Continue with Apple
      </MockButton>
    </div>
    <div className='my-4 h-px w-full bg-[--border-color]' />
    <div className='space-y-3'>
      <p className='text-xs font-semibold text-[--text-color]'>
        Or continue with email address
      </p>
      <div className='grid grid-cols-2 gap-3'>
        <MockField icon={User} label='First Name' placeholder='First Name' />
        <MockField icon={User} label='Last Name' placeholder='Last Name' />
      </div>
      <MockField icon={Mail} label='Email' placeholder='Email' />
      <MockField
        icon={LockKeyhole}
        label='Password'
        placeholder='Password'
        withReveal
      />
      <MockField
        icon={LockKeyhole}
        label='Confirm password'
        placeholder='Password'
        withReveal
      />
    </div>
    <div className='mt-4'>
      <MockButton>Sign up</MockButton>
    </div>
    <FooterNote>
      Already have an account?{' '}
      <span className='font-semibold text-[--text-color]'>Sign in</span>
    </FooterNote>
  </div>
);

export const ForgotPasswordScreen = ({
  headingText,
  supportText,
}: ScreenContext) => (
  <div className='w-full max-w-[340px]'>
    <ScreenHeading title={headingText} description={supportText} />
    <div className='space-y-3'>
      <MockField icon={Mail} label='Email' placeholder='Your email' />
      <MockButton>Continue</MockButton>
    </div>
    <FooterNote>
      Never mind,{' '}
      <span className='font-semibold text-[--text-color]'>back to sign in</span>
    </FooterNote>
  </div>
);

export const ResetPasswordScreen = ({
  headingText,
  supportText,
}: ScreenContext) => (
  <div className='w-full max-w-[340px]'>
    <ScreenHeading title={headingText} description={supportText} />
    <div className='space-y-3'>
      <MockField
        icon={LockKeyhole}
        label='New password'
        placeholder='New password'
        withReveal
      />
      <MockField
        icon={LockKeyhole}
        label='Confirm new password'
        placeholder='Confirm password'
        withReveal
      />
      <MockButton>Continue</MockButton>
    </div>
  </div>
);

export type { ScreenContext };
