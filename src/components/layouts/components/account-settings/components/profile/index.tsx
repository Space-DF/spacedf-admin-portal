import { zodResolver } from '@hookform/resolvers/zod';
import { CloudUpload, MapPin, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, Suspense, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Building, UserList } from '@/components/icons';
import {
  ProfileSchema,
  profileSchema,
} from '@/components/layouts/components/account-settings/components/profile/schema';
import { useMe } from '@/components/layouts/hooks/useMe';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import ImageWithBlur from '@/components/ui/image-blur';
import { InputWithIcon } from '@/components/ui/input';

import { useUpdateProfile } from './hooks/useUpdateProfile';

import AvtUser from '/public/images/avt-user.svg';

const DEFAULT_PROFILE = {
  first_name: '',
  last_name: '',
  location: '',
  company_name: '',
  title: '',
  avatar: undefined,
};

const Profile = () => {
  const t = useTranslations('accountSettings');

  const [previewImage, setPreviewImage] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: DEFAULT_PROFILE,
  });

  const { trigger: updateProfile, isMutating: isUpdatingProfile } =
    useUpdateProfile();
  const {
    reset,
    setValue,
    formState: { isDirty },
  } = form;

  const { data: profile, isLoading, mutate } = useMe();
  async function onSubmit(values: ProfileSchema) {
    await updateProfile(values, {
      onSuccess: () => {
        toast.success(t('update_user_profile'));
        mutate();
      },
      onError: () => {
        toast.error(t('update_user_profile_failed'));
      },
    });
  }

  useEffect(() => {
    if (!profile) return;
    reset({
      ...profile,
      avatar: undefined,
      location: profile.location || '',
      company_name: profile.company_name || '',
      title: profile.title || '',
    });
    setPreviewImage(profile.avatar);
  }, [profile]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0];
    if (!image) return;
    const previewImage = URL.createObjectURL(image);
    setValue('avatar', image as Blob, {
      shouldDirty: true,
    });
    setPreviewImage(previewImage);
  };

  const handleSelectImage = () => {
    fileRef.current?.click();
  };

  const previewImageSize = previewImage ? 96 : 40;

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
        className='animate-opacity-display-effect'
      >
        <p className='mb-3 font-semibold'>{t('avatar')}</p>
        <div className='mb-4 flex gap-3'>
          <Avatar className='flex h-24 w-24 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-600'>
            <Suspense fallback={<AvatarFallback>{t('avatar')}</AvatarFallback>}>
              <div className='relative'>
                <ImageWithBlur
                  src={previewImage || AvtUser}
                  width={previewImageSize}
                  height={previewImageSize}
                  alt='space-df'
                  className='size-full rounded-full object-cover'
                />
              </div>
            </Suspense>
          </Avatar>
          <div className='flex flex-col items-stretch justify-between py-3'>
            <Button
              variant='outline'
              className='w-max items-center gap-2 rounded-lg dark:text-white'
              size='lg'
              type='button'
              onClick={handleSelectImage}
            >
              {t('upload_new_image')} <CloudUpload size={16} />
            </Button>
            <p className='text-xs font-normal text-brand-text-gray'>
              {t('800x800_png_jpg_is_recommended_maximum_file_size_2mb')}
            </p>
          </div>
        </div>
        <div className='space-y-4'>
          <div className='flex gap-4'>
            <FormField
              control={form.control}
              name='first_name'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>{t('first_name')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                      prefixCpn={<UserRound size={16} />}
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
                  <FormLabel>{t('last_name')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                      prefixCpn={<UserRound size={16} />}
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
          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('location')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                    prefixCpn={<MapPin size={16} />}
                    placeholder={t('location')}
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
            name='company_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('company_name')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                    prefixCpn={<Building />}
                    placeholder={t('company_name')}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('title')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className='h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none'
                    prefixCpn={<UserList />}
                    placeholder={t('title')}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='mt-4 flex gap-2'>
          <DialogClose asChild>
            <Button
              type='button'
              size='lg'
              variant='outline'
              className='h-12 rounded-lg border-brand-stroke-dark-soft text-brand-text-gray shadow-none'
            >
              {t('cancel')}
            </Button>
          </DialogClose>

          <Button
            type='submit'
            size='lg'
            className='h-12 w-full items-center gap-2 rounded-lg border-4 border-brand-heading bg-brand-fill-outermost font-medium text-white shadow-sm dark:border-brand-stroke-outermost'
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
