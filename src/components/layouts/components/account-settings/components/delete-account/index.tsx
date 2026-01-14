import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  DeleteAccountSchema,
  deleteAccountSchema,
} from '@/components/layouts/components/account-settings/components/delete-account/schema';
import { useMe } from '@/components/layouts/hooks/useMe';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputWithIcon } from '@/components/ui/input';
// import { useDeleteAccount } from './hooks/useDeleteAccount';
// import { useProfile } from './hooks/useProfile';

const DeleteAccount = () => {
  const t = useTranslations('accountSettings');
  const form = useForm<DeleteAccountSchema>({
    resolver: zodResolver(deleteAccountSchema),
  });

  // const { trigger: deleteAccount, isMutating } = useDeleteAccount();
  const { data: me, isLoading } = useMe();

  const { isDirty, isValid } = form.formState;

  async function onSubmit(values: DeleteAccountSchema) {
    if (values.email !== me?.email) {
      return toast.error(t('email_not_match'));
    }
    // await deleteAccount();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='animate-opacity-display-effect'
      >
        <div className='space-y-4'>
          <div className='flex items-center gap-1 rounded bg-brand-semantic-accent-light p-2 text-xs font-semibold text-brand-semantic-accent dark:bg-brand-semantic-accent-dark-300 dark:text-brand-semantic-accent-300'>
            <TriangleAlert size={16} />
            {t('warning_this_is_a_potentially_destructive_action')}
          </div>
          <div className='font-semibold text-brand-text-dark dark:text-white'>
            {t('to_confirm_please_enter_your_email_below')}
          </div>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel className='font-semibold'>Email</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                    prefixCpn={<Mail size={16} />}
                    placeholder='Email'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='mt-4 flex gap-2'>
            <Button
              disabled={!isDirty || !isValid || isLoading}
              // loading={isMutating}
              size='lg'
              className='h-12 w-full border-2 border-brand-semantic-accent-dark bg-brand-semantic-accent-300 dark:bg-brand-semantic-accent-400'
              variant='destructive'
            >
              {t('permanently_delete_account')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default DeleteAccount;
