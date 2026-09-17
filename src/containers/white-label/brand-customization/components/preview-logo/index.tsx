import Image from 'next/image';

import { cn } from '@/lib/utils';

import { SpaceDFLogoFull } from '@/components/icons';

interface Props {
  isLight?: boolean;
  logoUrl?: string | null;
}

export const PreviewLogo = ({ isLight, logoUrl }: Props) => {
  return logoUrl ? (
    <Image
      src={logoUrl}
      alt='Application Logo Light'
      className='max-w-full object-contain size-12 rounded-sm'
      width={60}
      height={60}
      unoptimized
    />
  ) : (
    <div
      className='border-[0.5px] border-brand-very-light-blue/80 rounded-sm p-1 flex items-center justify-center'
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #C8C8C8 0%, #7B7B7B 100%)'
          : '#4B4E5D',
      }}
    >
      <SpaceDFLogoFull
        className={cn(isLight ? 'text-black' : 'text-white')}
        width={58}
        height={12}
      />
    </div>
  );
};
