import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { InfoOutline } from '@/components/icons';
import {
  PrivacySchema,
  privacySchema,
} from '@/components/layouts/components/account-settings/components/privacy/schema';
import { useMe } from '@/components/layouts/hooks/useMe';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputWithIcon } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Privacy = () => {
  const t = useTranslations('accountSettings');
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowNewPassword, setIsShowNewPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const form = useForm<PrivacySchema>({
    resolver: zodResolver(privacySchema),
  });

  function onSubmit(_values: PrivacySchema) {
    // Upon click this button:
    //   If 2.3, 2.4, 2.4 correct → Update Successfully → Redirect to [A.I.6 HOME SCREEN (Organization)]
    // Other case → Error Message
  }

  const { data: me } = useMe();

  useEffect(() => {
    if (me) {
      form.setValue('email', me.email);
    }
  }, [me]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='animate-opacity-display-effect'
      >
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                    prefixCpn={<Mail size={16} />}
                    placeholder='Email'
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className='!my-6' />
          <div className='rounded-md border-brand-component-stroke-dark-soft bg-brand-component-fill-dark-soft py-1 px-2.5 flex space-x-1 items-center'>
            <InfoOutline width={20} height={20} />
            <p className='text-sm text-brand-component-text-gray font-semibold leading-5'>
              {t(
                'when_you_log_in_with_your_google_account_you_can_create_your_own_password',
              )}
            </p>
          </div>
          <FormField
            control={form.control}
            name='current_password'
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel>{t('current_password')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                    prefixCpn={<LockKeyhole size={16} />}
                    type={isShowPassword ? 'text' : 'password'}
                    suffixCpn={
                      <span
                        className='cursor-pointer'
                        onClick={() => setIsShowPassword(!isShowPassword)}
                      >
                        {isShowPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </span>
                    }
                    placeholder={t('current_password')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='new_password'
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel>{t('new_password')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                    prefixCpn={<LockKeyhole size={16} />}
                    type={isShowNewPassword ? 'text' : 'password'}
                    suffixCpn={
                      <span
                        className='cursor-pointer'
                        onClick={() => setIsShowNewPassword(!isShowNewPassword)}
                      >
                        {isShowNewPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </span>
                    }
                    placeholder={t('new_password')}
                    {...field}
                  />
                </FormControl>
                <FormDescription className='text-xs font-medium text-brand-text-gray'>
                  {t('minimum_8_characters')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirm_password'
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel>{t('confirm_new_password')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                    prefixCpn={<LockKeyhole size={16} />}
                    type={isShowConfirmPassword ? 'text' : 'password'}
                    suffixCpn={
                      <span
                        className='cursor-pointer'
                        onClick={() =>
                          setIsShowConfirmPassword(!isShowConfirmPassword)
                        }
                      >
                        {isShowConfirmPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </span>
                    }
                    placeholder={t('confirm_new_password')}
                    {...field}
                  />
                </FormControl>
                <FormDescription className='text-xs font-medium text-brand-text-gray'>
                  {t('minimum_8_characters')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='mt-4 flex gap-2'>
            <Button size='lg' className='w-full'>
              {t('update_password')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default Privacy;
