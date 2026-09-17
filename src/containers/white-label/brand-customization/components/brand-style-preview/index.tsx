'use client';

import { ChevronDown, Minus, Play, Plus, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

import { Dashboard } from '@/containers/white-label/brand-customization/components/brand-style-preview/components/dashboard';
import { DeviceList } from '@/containers/white-label/brand-customization/components/brand-style-preview/components/device-list';
import { Sidebar } from '@/containers/white-label/brand-customization/components/brand-style-preview/components/sidebar';
import { HeaderUrl } from '@/containers/white-label/brand-customization/components/header-url';
import { PreviewLogo } from '@/containers/white-label/brand-customization/components/preview-logo';
import { useDimension } from '@/containers/white-label/brand-customization/hooks/use-dimension';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';

import DashboardPreview from '/public/images/dashboard-preview.png';

interface Props {
  domain?: string;
  isLoading?: boolean;
}

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 800;

export const BrandStylePreview = ({ domain, isLoading }: Props) => {
  const { theme, logoLightUrl } = useBrandStore(
    useShallow((state) => ({
      theme: state.theme,
      logoLightUrl: state.logoLightUrl,
    })),
  );

  const { watch } = useFormContext<BrandCustomizationFormValues>();
  const style = watch('style');

  const isLightMode = theme === 'light';
  const activeColors = isLightMode ? style?.lightColors : style?.darkColors;

  const primaryColor = activeColors?.primary || '#171A28';
  const primaryTextColor = activeColors?.primary_text || '#FCFCFC';
  const secondaryColor = activeColors?.secondary || '#FFFFFF';
  const secondaryTextColor = activeColors?.secondary_text || '#282828';
  const accentColor = activeColors?.accent || '#F0F1F3';
  const accentTextColor = activeColors?.accent_text || '#282828';
  const backgroundColor = activeColors?.background || '#FFFFFF';
  const borderColor = activeColors?.border || '#E0E2E7';
  const textColor = activeColors?.text || '#1F2937';
  const supportTextColor = activeColors?.support_text || '#667085';
  const cardColor = activeColors?.card || '#FFFFFF';
  const switchBackgroundColor = activeColors?.switch_background || '#EDEDED';
  const inputColor = activeColors?.input || '#f0f1f3';
  const inputBorderColor = activeColors?.input_border || '#E0E2E7';

  // Legacy aliases kept so the preview's child components keep rendering
  // after the preset keys were consolidated.
  const deviceCardColor = cardColor;
  const widgetCardColor = cardColor;
  const widgetBorderColor = borderColor;

  const buttonBorderRadius = style?.buttonBorderRadius ?? 8;
  const inputBorderRadius = style?.inputBorderRadius ?? 8;
  const cardBorderRadius = style?.cardBorderRadius ?? 6;

  const { containerRef, scale, dimensions } = useDimension(
    VIRTUAL_WIDTH,
    VIRTUAL_HEIGHT,
  );

  return (
    <div
      ref={containerRef}
      className='flex-1 flex justify-center items-center p-6 md:p-12 z-10 w-full h-full relative overflow-hidden'
    >
      <div
        className='bg-brand-component-fill-dark rounded-xl border border-brand-component-stroke-dark-soft shadow-2xl flex flex-col overflow-hidden transition-all duration-300 absolute'
        style={
          {
            width: VIRTUAL_WIDTH,
            height: VIRTUAL_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center center',
            left: '50%',
            top: '50%',
            opacity: dimensions.width > 0 ? 1 : 0,
            '--primary-color': primaryColor,
            '--primary-text-color': primaryTextColor,
            '--secondary-color': secondaryColor,
            '--secondary-text-color': secondaryTextColor,
            '--accent-color': accentColor,
            '--accent-text-color': accentTextColor,
            '--background-color': backgroundColor,
            '--border-color': borderColor,
            '--text-color': textColor,
            '--support-text-color': supportTextColor,
            '--card-color': cardColor,
            '--switch-background-color': switchBackgroundColor,
            '--input-color': inputColor,
            '--input-border-color': inputBorderColor,
            '--device-card-color': deviceCardColor,
            '--widget-card-color': widgetCardColor,
            '--widget-border-color': widgetBorderColor,
            '--button-border-radius': `${buttonBorderRadius}px`,
            '--input-border-radius': `${inputBorderRadius}px`,
            '--card-border-radius': `${cardBorderRadius}px`,
          } as React.CSSProperties
        }
      >
        <HeaderUrl domain={domain} isLoading={isLoading} />
        <div
          className={`flex-1 flex min-h-0 overflow-hidden select-none transition-colors duration-300 ${theme}`}
          style={{ backgroundColor }}
        >
          <Sidebar />
          <div className='relative h-full shrink-0'>
            <Image
              src={DashboardPreview}
              alt='Dashboard Preview'
              className='-ml-2 object-cover h-full w-auto'
            />
            <div className='absolute top-2 left-1.5 z-10'>
              <PreviewLogo isLight={isLightMode} logoUrl={logoLightUrl} />
            </div>
            <div className='absolute top-2 right-4 z-10'>
              <div className='flex space-x-4'>
                <div className='flex items-center gap-x-1.5 rounded-[--input-border-radius] px-2 h-6 border border-[--border-color] bg-[--background-color] hover:bg-[--input-color] text-[--text-color] text-[9px] font-semibold select-none shadow-inset-white'>
                  <span>Default Model</span>
                  <ChevronDown className='size-3 opacity-80 text-[--support-text-color]' />
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center rounded-[--button-border-radius] justify-center size-6 border border-brand-component-stroke-dark bg-[--primary-color] hover:bg-[--primary-color] text-[--primary-text-color] shadow-inset-white'>
                    <Plus className='size-3' />
                  </div>
                  <div className='flex items-center rounded-[--button-border-radius] justify-center size-6 border border-brand-component-stroke-dark bg-[--primary-color] hover:bg-[--primary-color] text-[--primary-text-color] shadow-inset-white'>
                    <Minus className='size-3' />
                  </div>
                  <div className='flex items-center rounded-[--button-border-radius] justify-center size-6 border border-brand-component-stroke-dark bg-[--primary-color] hover:bg-[--primary-color] text-[--primary-text-color] shadow-inset-white'>
                    <RefreshCcw className='size-3' />
                  </div>
                  <div className='flex items-center rounded-[--button-border-radius] justify-center size-6 border border-brand-component-stroke-dark bg-[--primary-color] hover:bg-[--primary-color] text-[--primary-text-color] shadow-inset-white'>
                    <Play className='size-3' />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='w-64 shrink-0 border-r border-[--border-color] h-full transition-colors duration-300'>
            <DeviceList />
          </div>
          <div className='flex-1 h-full min-w-0 overflow-hidden transition-colors duration-300'>
            <Dashboard />
          </div>
        </div>
      </div>
    </div>
  );
};
