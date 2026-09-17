import { ComponentType } from 'react';
import {
  Control,
  Controller,
  UseFormRegister,
  useWatch,
} from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';

interface SocialLinkRowProps {
  socialKey: string;
  label: string;
  icon: ComponentType<{ className: string }>;
  control: Control<BrandCustomizationFormValues>;
  register: UseFormRegister<BrandCustomizationFormValues>;
}

export const SocialLinkRow = ({
  socialKey,
  label,
  icon: Icon,
  control,
  register,
}: SocialLinkRowProps) => {
  const enabled = useWatch({
    control,
    name: `email.socialLinks.${socialKey}.enabled`,
    defaultValue: false,
  });

  return (
    <div className='flex items-center gap-3'>
      <div className='flex justify-center items-center size-8 bg-[#2F313E] rounded-full'>
        <Icon className='size-4 text-white' />
      </div>
      <span className='text-sm font-medium text-brand-component-text-dark w-16 shrink-0'>
        {label}
      </span>
      <Controller
        control={control}
        name={`email.socialLinks.${socialKey}.enabled`}
        defaultValue={false}
        render={({ field: { value, onChange } }) => (
          <Switch checked={!!value} onCheckedChange={onChange} />
        )}
      />
      <Input
        {...register(`email.socialLinks.${socialKey}.url`)}
        disabled={!enabled}
        placeholder={`https://${socialKey === 'tiktok' ? 'tiktok.com/@' : `${socialKey}.com/`}`}
        className='flex-1 truncate rounded-lg text-sm text-brand-component-text-dark font-medium h-9 disabled:opacity-40'
      />
    </div>
  );
};
