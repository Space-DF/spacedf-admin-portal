'use client';

import { Dice5, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Vibrant } from 'node-vibrant/browser';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

import { cn } from '@/lib/utils';

import { FavIcon } from '@/components/icons';
import {
  PreferencesModeDark,
  PreferencesModeLight,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/ui/motion-tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { AdvanceCustomize } from '@/containers/white-label/brand-customization/components/brand-style/components/advance-customize';
import PresetSwatch from '@/containers/white-label/brand-customization/components/brand-style/components/preset-swatch';
import SliderWithTooltip from '@/containers/white-label/brand-customization/components/brand-style/components/slider-with-tooltip';
import {
  BRAND_PRESETS,
  PresetColors,
  PresetRadius,
} from '@/containers/white-label/brand-customization/components/brand-style/presets';
import { generateSuggestedPalettes } from '@/containers/white-label/brand-customization/components/brand-style/utils';
import {
  BrandCustomizationFormValues,
  DEFAULT_BRAND_CUSTOMIZATION,
} from '@/containers/white-label/brand-customization/schema';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';

const DEFAULT_EXTRACTED_COLOR = ['#424242', '#7f7f7f', '#bcbcbc'];

export const BrandStyle = () => {
  const t = useTranslations('white-label');

  const {
    faviconLightUrl,
    faviconDarkUrl,
    theme,
    setTheme,
    selectedPaletteId,
    setSelectedPaletteId,
  } = useBrandStore(
    useShallow((state) => ({
      faviconLightUrl: state.faviconLightUrl,
      faviconDarkUrl: state.faviconDarkUrl,
      theme: state.theme,
      setTheme: state.setTheme,
      selectedPaletteId: state.selectedPaletteId,
      setSelectedPaletteId: state.setSelectedPaletteId,
    })),
  );

  const { setValue } = useFormContext<BrandCustomizationFormValues>();

  const isLightMode = theme === 'light';

  const [extractedColors, setExtractedColors] = useState<string[]>(
    DEFAULT_EXTRACTED_COLOR,
  );

  const [selectedPreset, setSelectedPreset] = useState<string | undefined>();
  const selectedPresetData = BRAND_PRESETS.find((p) => p.id === selectedPreset);

  const lightSuggestedPalettes = generateSuggestedPalettes(
    extractedColors,
    true,
  );
  const darkSuggestedPalettes = generateSuggestedPalettes(
    extractedColors,
    false,
  );
  const suggestedPalettes = isLightMode
    ? lightSuggestedPalettes
    : darkSuggestedPalettes;

  const activeFavicon = faviconLightUrl || faviconDarkUrl;

  useEffect(() => {
    if (!activeFavicon) {
      setExtractedColors(DEFAULT_EXTRACTED_COLOR);
      return;
    }

    const isRemote =
      activeFavicon.startsWith('http://') ||
      activeFavicon.startsWith('https://');
    const vibrantUrl = isRemote
      ? `/_next/image?url=${encodeURIComponent(activeFavicon)}&w=48&q=75`
      : activeFavicon;

    Vibrant.from(vibrantUrl)
      .getPalette()
      .then((palette) => {
        const colors: string[] = [];
        if (palette.Vibrant) colors.push(palette.Vibrant.hex);
        if (palette.DarkVibrant) colors.push(palette.DarkVibrant.hex);
        if (palette.LightVibrant) colors.push(palette.LightVibrant.hex);
        if (palette.Muted) colors.push(palette.Muted.hex);

        const uniqueColors = Array.from(new Set(colors));
        if (uniqueColors.length < 3) {
          uniqueColors.push(...DEFAULT_EXTRACTED_COLOR);
        }
        setExtractedColors(uniqueColors.slice(0, 4));
      })
      .catch(() => {
        setExtractedColors(DEFAULT_EXTRACTED_COLOR);
      });
  }, [activeFavicon]);

  const applyColors = (lightColors: PresetColors, darkColors: PresetColors) => {
    setValue('style.lightColors', lightColors, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue('style.darkColors', darkColors, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const applyRadius = (radius: PresetRadius) => {
    setValue('style.buttonBorderRadius', radius.button, { shouldDirty: true });
    setValue('style.inputBorderRadius', radius.input, { shouldDirty: true });
    setValue('style.cardBorderRadius', radius.card, { shouldDirty: true });
  };

  const handleSelectPreset = (id: string) => {
    const preset = BRAND_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setSelectedPreset(id);
    setSelectedPaletteId(undefined);
    applyColors(preset.lightColors, preset.darkColors);
    applyRadius(preset.radius);
  };

  const handleReset = () => {
    const defaultStyle = DEFAULT_BRAND_CUSTOMIZATION.style;
    setSelectedPreset('default');
    setSelectedPaletteId(undefined);
    applyColors(
      defaultStyle?.lightColors as PresetColors,
      defaultStyle?.darkColors as PresetColors,
    );
    setValue('style.buttonBorderRadius', defaultStyle?.buttonBorderRadius, {
      shouldDirty: true,
    });
    setValue('style.inputBorderRadius', defaultStyle?.inputBorderRadius, {
      shouldDirty: true,
    });
    setValue('style.cardBorderRadius', defaultStyle?.cardBorderRadius, {
      shouldDirty: true,
    });
  };

  const handleRandom = () => {
    const candidates = BRAND_PRESETS.filter((p) => p.id !== selectedPreset);
    const pool = candidates.length > 0 ? candidates : BRAND_PRESETS;
    const preset = pool[Math.floor(Math.random() * pool.length)];
    setSelectedPreset(preset.id);
    setSelectedPaletteId(undefined);
    applyColors(preset.lightColors, preset.darkColors);
    applyRadius(preset.radius);
  };

  const applyPalette = (id: number) => {
    setSelectedPreset(undefined);
    setSelectedPaletteId(id);
    const lightColors = lightSuggestedPalettes.find(
      (palette) => palette.id === id,
    )?.colors;
    const darkColors = darkSuggestedPalettes.find(
      (palette) => palette.id === id,
    )?.colors;

    if (lightColors && darkColors) {
      applyColors(lightColors, darkColors);
    }
  };

  return (
    <div className='animate-opacity-display-effect space-y-6'>
      <div className='flex items-center justify-between gap-2 pb-4 border-b border-dashed border-brand-component-stroke-dark-soft'>
        <span className='font-semibold text-[16px] leading-6'>
          {t('theme_appearance')}
        </span>
        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={handleReset}
          title={t('reset_to_default')}
          className='size-8 shrink-0 rounded-[10px]'
        >
          <RotateCcw className='size-4' />
        </Button>
      </div>
      <div className='space-y-3'>
        <div className='space-y-1'>
          <Label className='text-[16px] font-semibold text-brand-component-text-dark'>
            {t('appearance')}
          </Label>
          <p className='text-body text-brand-component-text-gray font-normal leading-normal'>
            {t('choose_themes_to_customize')}
          </p>
        </div>
        <div className='grid grid-cols-2 gap-1.5'>
          <div
            className={cn(
              'flex-1 cursor-pointer rounded-xl border p-2 duration-300 hover:border-brand-text-dark dark:bg-brand-heading dark:text-white hover:dark:border-brand-dark-fill-secondary',
              isLightMode
                ? 'border-brand-component-stroke-dark'
                : 'border-brand-component-stroke-dark-soft hover:border-brand-component-stroke-dark hover:scale-105 bg-brand-component-fill-dark-soft',
            )}
            onClick={() => setTheme('light')}
          >
            <div className='flex items-center justify-center rounded-lg bg-brand-fill-dark-soft p-1.5 dark:bg-brand-text-dark'>
              <PreferencesModeLight className='fill-[#F0F1F3] dark:fill-[#525D73]' />
            </div>

            <div className='flex items-center justify-center pt-3'>
              <span className='text-xs font-semibold text-brand-component-text-dark dark:text-white'>
                {t('light_mode')}
              </span>
            </div>
          </div>
          <div
            className={cn(
              'flex-1 cursor-pointer rounded-xl border p-2 duration-300 hover:border-brand-text-dark dark:bg-brand-heading dark:text-white hover:dark:border-brand-dark-fill-secondary',
              !isLightMode
                ? 'border-brand-component-stroke-dark'
                : 'border-brand-component-stroke-dark-soft hover:border-brand-component-stroke-dark hover:scale-105 bg-brand-component-fill-dark-soft',
            )}
            onClick={() => setTheme('dark')}
          >
            <div className='flex items-center justify-center rounded-lg bg-brand-component-fill-gray p-1.5 dark:bg-brand-text-dark'>
              <PreferencesModeDark className='fill-[#C2C6CE] dark:fill-brand-text-dark' />
            </div>
            <div className='flex items-center justify-center pt-3'>
              <span className='text-xs font-semibold text-brand-component-text-dark dark:text-white'>
                {t('dark_mode')}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className='space-y-5'>
        <div className='flex items-center justify-between'>
          <Label className='text-[16px] font-semibold text-brand-component-text-dark'>
            {t('presets')}
          </Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleRandom}
            className='gap-x-2 rounded-[10px]'
          >
            <Dice5 className='size-4' />
            {t('random')}
          </Button>
        </div>
        <Select value={selectedPreset} onValueChange={handleSelectPreset}>
          <SelectTrigger className='h-9 rounded-xl border-brand-component-stroke-dark-soft'>
            {selectedPresetData ? (
              <div className='flex items-center gap-2'>
                <PresetSwatch colors={selectedPresetData.swatch} />
                <span className='text-sm font-medium text-brand-component-text-dark'>
                  {t(selectedPresetData.nameKey)}
                </span>
              </div>
            ) : (
              <span className='text-sm text-brand-component-text-gray'>
                {t('select_preset')}
              </span>
            )}
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            {BRAND_PRESETS.map((preset) => (
              <SelectItem
                key={preset.id}
                value={preset.id}
                showCheckIcon={false}
                className='rounded-lg py-2 pl-2 pr-2'
              >
                <div className='flex items-center gap-2'>
                  <PresetSwatch colors={preset.swatch} />
                  <span className='text-sm font-medium text-brand-component-text-dark'>
                    {t(preset.nameKey)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Tabs defaultValue='colors' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 rounded-xl mb-2'>
          <TabsTrigger
            value='colors'
            className='w-full'
            motionHighlightClassName='rounded-[10px]'
          >
            {t('colors')}
          </TabsTrigger>
          <TabsTrigger
            value='other'
            className='w-full'
            motionHighlightClassName='rounded-[10px]'
          >
            {t('other')}
          </TabsTrigger>
        </TabsList>
        <TabsContents>
          <TabsContent value='colors'>
            <div className='space-y-4'>
              <div className='space-y-3'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Label className='text-[16px] leading-6 font-semibold text-brand-component-text-dark'>
                      {t('brand_color_analysis')}
                    </Label>
                    <span className='bg-brand-component-fill-secondary-soft text-brand-component-text-secondary text-xs font-semibold px-2 leading-4 rounded-sm select-none tracking-wider border border-brand-component-stroke-secondary-soft'>
                      {t('experiment')}
                    </span>
                  </div>
                  <p className='text-body leading-5 text-brand-component-text-gray font-normal'>
                    {t('analyze_primary_color_hint')}
                  </p>
                </div>
                <div className='border-2 border-transparent rounded-xl p-3 space-y-3 [background:linear-gradient(#FAFAFA,#FAFAFA)_padding-box,linear-gradient(76deg,#6E4AFF_0%,#A78BF6_100.07%)_border-box]'>
                  <div className='flex gap-x-2 items-center'>
                    <div className='size-12 rounded-md border border-brand-component-stroke-dark-soft flex items-center justify-center bg-brand-background-fill-surface shrink-0 p-1'>
                      {activeFavicon ? (
                        <Image
                          src={activeFavicon}
                          alt='Favicon'
                          className='size-10 object-contain'
                          width={40}
                          height={40}
                          unoptimized
                        />
                      ) : (
                        <FavIcon className='size-12 text-brand-component-text-dark font-medium' />
                      )}
                    </div>
                    <div className='space-y-2 flex-1'>
                      <span className='text-body font-medium text-brand-component-text-dark'>
                        {t('extracted_colors')}
                      </span>
                      <div className='flex gap-x-1'>
                        {extractedColors.map((color, idx) => (
                          <div
                            key={idx}
                            style={{ backgroundColor: color }}
                            className='size-5 rounded-full border border-brand-component-stroke-light-fixed shadow-sm cursor-pointer hover:scale-110 active:scale-95 duration-150 relative group'
                            title={color}
                          >
                            <span className='absolute hidden group-hover:block bottom-7 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap z-50'>
                              {color}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <span className='text-xs font-semibold text-brand-component-text-dark'>
                      {t('suggested_palettes')}
                    </span>

                    <div className='grid grid-cols-3 gap-2'>
                      {suggestedPalettes.map((palette) => (
                        <div
                          key={palette.id}
                          onClick={() => applyPalette(palette.id)}
                          className={cn(
                            'border border-brand-component-stroke-dark-soft rounded-lg p-2 flex items-center justify-center bg-brand-component-fill-dark-soft cursor-pointer hover:border-primary hover:shadow-sm duration-200 active:scale-98',
                            selectedPaletteId === palette.id &&
                              'border-primary bg-brand-component-fill-light',
                          )}
                        >
                          <div className='flex items-center'>
                            {palette.swatch.map((color, idx) => (
                              <div
                                key={idx}
                                style={{
                                  backgroundColor: color,
                                  zIndex: (idx + 1) * 10,
                                }}
                                className={cn(
                                  'size-7 rounded-full border border-white shadow-sm',
                                  idx > 0 && '-ml-2',
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <AdvanceCustomize />
            </div>
          </TabsContent>
          <TabsContent value='other'>
            <div className='space-y-5'>
              <SliderWithTooltip
                label={t('button_border_radius')}
                description={t('change_button_radius_hint')}
                valueKey='buttonBorderRadius'
              />

              <SliderWithTooltip
                label={t('input_border_radius')}
                description={t('change_input_radius_hint')}
                valueKey='inputBorderRadius'
              />
              <SliderWithTooltip
                label={t('card_border_radius')}
                description={t('change_card_radius_hint')}
                valueKey='cardBorderRadius'
              />
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
};
