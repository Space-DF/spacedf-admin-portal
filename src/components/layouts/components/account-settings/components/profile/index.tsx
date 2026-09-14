import { zodResolver } from '@hookform/resolvers/zod';
import { CloudUpload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, Suspense, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import {
  ProfileSchema,
  profileSchema,
} from '@/components/layouts/components/account-settings/components/profile/schema';
import { useMe } from '@/components/layouts/hooks/useMe';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import ImageWithBlur from '@/components/ui/image-blur';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useUpdateProfile } from './hooks/useUpdateProfile';

import AvtUser from '/public/images/avt-user.svg';

const AVATAR_SIZE = 36;

const LABEL_CLASS = 'font-semibold text-brand-component-text-dark';
const INPUT_CLASS =
  'h-9 rounded-xl border-brand-component-stroke-dark-soft shadow-none';

const Profile = () => {
  const t = useTranslations('accountSettings');

  const [previewImage, setPreviewImage] = useState<string>();
  const [isAvatarError, setIsAvatarError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
  });

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfile();
  const {
    reset,
    setValue,
    formState: { isDirty },
  } = form;

  const { data: profile, isLoading, refetch } = useMe();
  async function onSubmit(values: ProfileSchema) {
    await updateProfile(values, {
      onSuccess: () => {
        toast.success(t('update_user_profile'));
        refetch();
      },
      onError: () => {
        toast.error(t('update_user_profile_failed'));
      },
    });
  }

  useEffect(() => {
    if (!profile) return;
    reset({
      first_name: profile.first_name,
      last_name: profile.last_name,
      avatar: profile.avatar ?? undefined,
    });
    setPreviewImage(profile.url_avatar);
    setIsAvatarError(false);
  }, [profile, reset]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0];
    if (!image) return;
    const previewImage = URL.createObjectURL(image);
    setValue('avatar', image as Blob, { shouldDirty: true });
    setPreviewImage(previewImage);
    setIsAvatarError(false);
  };

  const handleSelectImage = () => {
    fileRef.current?.click();
  };

  return (
    <Form {...form}>
      <input
        type='file'
        ref={fileRef}
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='animate-opacity-display-effect flex flex-1 flex-col'
      >
        <div className='flex-1 space-y-4'>
          <div className='space-y-1.5'>
            <p className={LABEL_CLASS}>{t('avatar')}</p>
            <div className='flex items-center gap-2'>
              <Avatar className='flex size-9 items-center justify-center bg-brand-component-fill-secondary-soft'>
                <Suspense
                  fallback={<AvatarFallback>{t('avatar')}</AvatarFallback>}
                >
                  <ImageWithBlur
                    src={isAvatarError ? AvtUser : previewImage || AvtUser}
                    width={AVATAR_SIZE}
                    height={AVATAR_SIZE}
                    alt='space-df'
                    className='rounded-full object-cover'
                    onError={() => setIsAvatarError(true)}
                  />
                </Suspense>
              </Avatar>
              <Button
                variant='outline'
                className='h-6 gap-2 rounded-lg border-brand-component-stroke-dark-soft px-2 py-1 text-xs font-semibold text-brand-component-text-dark'
                type='button'
                onClick={handleSelectImage}
              >
                <CloudUpload size={16} />
                {t('upload_new_image')}
              </Button>
            </div>
          </div>

          <div className='flex gap-4'>
            <FormField
              control={form.control}
              name='first_name'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel className={LABEL_CLASS}>
                    {t('first_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={INPUT_CLASS}
                      placeholder={t('first_name')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='last_name'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel className={LABEL_CLASS}>
                    {t('last_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={INPUT_CLASS}
                      placeholder={t('last_name')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='profile-email' className={LABEL_CLASS}>
              {t('email')}
            </Label>
            <Input
              id='profile-email'
              value={profile?.email ?? ''}
              readOnly
              disabled
              className={cn(
                INPUT_CLASS,
                'bg-brand-component-fill-disabled text-brand-component-text-disabled disabled:opacity-100 dark:bg-brand-component-fill-disabled dark:text-brand-component-text-disabled',
              )}
            />
          </div>
        </div>

        <div className='-mx-4 -mb-4 mt-4 px-4 py-3'>
          <Button
            type='submit'
            className='h-9 w-full rounded-xl font-semibold bg-brand-component-fill-dark text-brand-component-text-light hover:bg-brand-component-hover-dark dark:bg-brand-component-fill-dark dark:text-brand-component-text-light hover:dark:bg-brand-component-hover-dark'
            loading={isUpdatingProfile}
            disabled={!isDirty}
          >
            {t('save_changes')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Profile;
