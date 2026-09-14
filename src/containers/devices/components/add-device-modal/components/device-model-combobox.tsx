'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useDialogPortalContainer } from '@/components/ui/dialog';
import { inputFocusRingClasses } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDeviceModel } from '@/containers/devices/components/add-device-modal/hooks/useDeviceModel';

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';

interface DeviceModelComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  limit?: number;
  container?: HTMLElement | null;
}

const DeviceModelCombobox = forwardRef<
  HTMLButtonElement,
  DeviceModelComboboxProps
>(
  (
    {
      value,
      onValueChange,
      placeholder,
      className,
      contentClassName,
      disabled,
      limit = 100,
      container,
    },
    ref,
  ) => {
    const t = useTranslations('organization');
    const dialogPortalContainer = useDialogPortalContainer();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const commandListRef = useRef<HTMLDivElement>(null);
    const didScrollToSelectedOnOpenRef = useRef(false);
    const [open, setOpen] = useState(false);
    const [highlightedModelId, setHighlightedModelId] = useState<
      string | undefined
    >(undefined);
    const [search, setSearch] = useState('');
    const searchDebounced = useDebounce(search);
    const { deviceModels, isLoading } = useDeviceModel(searchDebounced, limit);
    const [selectedDeviceModel, setSelectedDeviceModel] = useState<
      string | undefined
    >(undefined);

    const selectedLabel = useMemo(() => {
      if (!selectedDeviceModel) return null;

      const model = deviceModels.find(
        (item) => item.id === selectedDeviceModel,
      );
      return model
        ? `${model.manufacturer_name} - ${capitalizeFirstLetter(model.device_type)}`
        : null;
    }, [selectedDeviceModel, deviceModels]);

    useEffect(() => {
      setSelectedDeviceModel(value);
    }, [value]);

    useEffect(() => {
      if (open) {
        setHighlightedModelId(selectedDeviceModel);
      }
    }, [open, selectedDeviceModel]);

    useEffect(() => {
      if (!open) {
        didScrollToSelectedOnOpenRef.current = false;
        return;
      }

      if (
        didScrollToSelectedOnOpenRef.current ||
        !selectedDeviceModel ||
        isLoading
      ) {
        return;
      }

      const isSelectedInList = deviceModels.some(
        (model) => model.id === selectedDeviceModel,
      );
      if (!isSelectedInList) return;

      didScrollToSelectedOnOpenRef.current = true;

      const frame = requestAnimationFrame(() => {
        commandListRef.current
          ?.querySelector(`[data-value="${CSS.escape(selectedDeviceModel)}"]`)
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });

      return () => cancelAnimationFrame(frame);
    }, [open, selectedDeviceModel, deviceModels, isLoading]);

    const handleOpenChange = (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (nextOpen) {
        setHighlightedModelId(selectedDeviceModel);
      }
      if (!nextOpen) setSearch('');
    };

    const handleSelect = (modelId: string) => {
      onValueChange(modelId);
      setSelectedDeviceModel(modelId);
      setOpen(false);
      setSearch('');
    };

    const portalContainer = container ?? dialogPortalContainer;

    return (
      <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type='button'
            disabled={disabled}
            className={cn(
              'flex h-9 w-full items-center justify-between rounded-xl border border-brand-stroke-dark-soft bg-brand-component-fill-light px-3 text-sm font-normal shadow-none disabled:cursor-not-allowed disabled:opacity-50',
              inputFocusRingClasses,
              className,
            )}
          >
            <span
              className={cn(
                'truncate',
                !selectedLabel && 'text-brand-component-text-gray',
              )}
            >
              {selectedLabel ?? placeholder ?? t('select_device_model')}
            </span>
            <ChevronDown className='size-4 shrink-0 opacity-50' />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={cn('z-[60] p-0', contentClassName)}
          align='start'
          container={portalContainer}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            requestAnimationFrame(() => searchInputRef.current?.focus());
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <Command
            shouldFilter={false}
            value={highlightedModelId}
            onValueChange={setHighlightedModelId}
          >
            <CommandInput
              ref={searchInputRef}
              containerClassName='bg-brand-component-fill-dark-soft'
              placeholder={t('device_model')}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList ref={commandListRef}>
              <CommandEmpty>
                {isLoading ? t('loading') : t('no_device_models_found')}
              </CommandEmpty>
              <CommandGroup>
                {deviceModels.map((model) => (
                  <CommandItem
                    key={model.id}
                    value={model.id}
                    onSelect={() => handleSelect(model.id)}
                    className={cn(
                      model.id === selectedDeviceModel &&
                        'bg-brand-component-fill-dark-soft text-brand-component-text-dark',
                    )}
                  >
                    {`${capitalizeFirstLetter(model.manufacturer_name)} - ${capitalizeFirstLetter(model.device_type)}`}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

DeviceModelCombobox.displayName = 'DeviceModelCombobox';

export { DeviceModelCombobox };
