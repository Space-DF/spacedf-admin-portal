import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

import { PaintBrush } from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import FaviconUploadCard from '@/containers/white-label/brand-customization/components/brand-identity/components/advance-custom-logo/components/upload-favicon';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';

export const AdvanceCustomLogo = () => {
  const t = useTranslations('white-label');
  const { control, setValue } = useFormContext<BrandCustomizationFormValues>();

  const {
    faviconLightUrl,
    faviconDarkUrl,
    setFaviconLightUrl,
    setFaviconDarkUrl,
  } = useBrandStore(
    useShallow((state) => ({
      faviconLightUrl: state.faviconLightUrl,
      faviconDarkUrl: state.faviconDarkUrl,
      setFaviconLightUrl: state.setFaviconLightUrl,
      setFaviconDarkUrl: state.setFaviconDarkUrl,
    })),
  );

  const setFaviconLight = (file: File | null) => {
    setFaviconLightUrl(file ? URL.createObjectURL(file) : null);
    setValue('brandIdentity.faviconLight', file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const setFaviconDark = (file: File | null) => {
    setFaviconDarkUrl(file ? URL.createObjectURL(file) : null);
    setValue('brandIdentity.faviconDark', file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Accordion
      type='single'
      collapsible
      className='w-full max-w-lg rounded-lg border border-brand-component-stroke-secondary'
      defaultValue=''
    >
      <AccordionItem
        value='additional'
        className='border-b px-0 last:border-b-0'
      >
        <AccordionTrigger className='hover:no-underline p-3'>
          <div className='space-y-1 flex flex-col'>
            <div className='flex items-center space-x-2'>
              <PaintBrush />
              <span className='text-brand-component-text-dark font-semibold text-body'>
                {t('additional_logos_icons')}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className='space-y-4 pt-2 pb-4 px-3'>
          <div className='space-y-2'>
            <div className='space-y-1 flex flex-col'>
              <h4 className='text-body font-semibold text-brand-component-text-dark'>
                {t('browser_icon_favicon')}
              </h4>
              <p className='text-body text-brand-component-text-gray font-normal'>
                {t('upload_icons_for_browser_tabs_and_bookmarks')}
              </p>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={control}
                name='brandIdentity.faviconLight'
                render={() => (
                  <FormItem>
                    <FaviconUploadCard
                      value={faviconLightUrl || null}
                      onChange={setFaviconLight}
                      mode='light'
                      fallbackValue={faviconDarkUrl}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='brandIdentity.faviconDark'
                render={() => (
                  <FormItem>
                    <FaviconUploadCard
                      value={faviconDarkUrl || null}
                      onChange={setFaviconDark}
                      mode='dark'
                      fallbackValue={faviconLightUrl}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
