'use client';

import { Table } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { memo, useMemo } from 'react';
import { UseFieldArrayRemove, UseFormReturn, useWatch } from 'react-hook-form';

import { Trash } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { DeviceModelCombobox } from '@/containers/devices/components/add-device-modal/components/device-model-combobox';
import { EUIDevice } from '@/containers/devices/components/add-device-modal/validator';

type EUIRow = EUIDevice['eui'][0] & { id: string };

interface Props {
  table: Table<EUIRow>;
  form: UseFormReturn<EUIDevice>;
  remove: UseFieldArrayRemove;
  onClearSelection: () => void;
}

const BulkSelectionToolbar = ({
  table,
  form,
  remove,
  onClearSelection,
}: Props) => {
  const t = useTranslations('organization');
  const { setValue, control } = form;
  const euiValues = useWatch({ control, name: 'eui' });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedIndices = useMemo(
    () => selectedRows.map((row) => row.index),
    [selectedRows],
  );

  const consensusDeviceModelId = useMemo(() => {
    if (!selectedIndices.length || !euiValues) {
      return undefined;
    }

    const firstRowIndex = selectedIndices[0];
    const modelFromFirstRow =
      euiValues[firstRowIndex]?.device_model?.trim() ?? '';

    if (!modelFromFirstRow) {
      return undefined;
    }

    const everySelectedRowHasThatModel = selectedIndices.every((index) => {
      const rowModel = euiValues[index]?.device_model?.trim() ?? '';
      return rowModel === modelFromFirstRow;
    });

    return everySelectedRowHasThatModel ? modelFromFirstRow : undefined;
  }, [selectedIndices, euiValues]);

  const publishState = useMemo(() => {
    if (!selectedIndices.length) return false;

    const publishedValues = selectedIndices.map(
      (index) => !!euiValues?.[index]?.is_published,
    );
    const allPublished = publishedValues.every(Boolean);
    const nonePublished = publishedValues.every((value) => !value);

    if (allPublished) return true;
    if (nonePublished) return false;
    return 'indeterminate';
  }, [selectedIndices, euiValues]);

  const handleClearSelection = () => {
    table.toggleAllPageRowsSelected(false);
    onClearSelection();
  };

  const handleAssignDeviceModel = (modelId: string) => {
    selectedIndices.forEach((index) => {
      setValue(`eui.${index}.device_model`, modelId, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const handlePublishChange = (published: boolean) => {
    selectedIndices.forEach((index) => {
      setValue(`eui.${index}.is_published`, published, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const handleDeleteSelected = () => {
    const indicesToRemove = [...selectedIndices].sort((a, b) => b - a);
    indicesToRemove.forEach((index) => remove(index));
    handleClearSelection();
  };
  const checkboxValue = useMemo(() => {
    if (table.getIsAllPageRowsSelected()) return true;
    return table.getIsSomePageRowsSelected() ? 'indeterminate' : false;
  }, [table]);

  if (!selectedCount) return null;

  return (
    <div className='sticky top-0 z-10 flex w-full items-center justify-between gap-4 border-b border-brand-component-stroke-dark-soft bg-brand-fill-dark-soft px-2 py-2'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <Checkbox
          checked={checkboxValue}
          onCheckedChange={handleClearSelection}
          aria-label={t('select_all')}
        />
        <span className='shrink-0 text-sm font-medium text-brand-component-text-dark'>
          {t('devices_selected', { count: selectedCount })}
        </span>
        <DeviceModelCombobox
          value={consensusDeviceModelId}
          onValueChange={handleAssignDeviceModel}
          placeholder={t('assign_device_model')}
          className='h-8 w-48'
          contentClassName='w-48'
        />
      </div>
      <div className='flex shrink-0 items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <Label className='font-semibold text-brand-component-text-gray'>
            {t('publish_selected_devices')}
          </Label>
          <Switch
            checked={publishState}
            onCheckedChange={handlePublishChange}
          />
        </div>
        <Separator
          orientation='vertical'
          className='h-8 w-px bg-brand-component-stroke-dark-soft'
        />
        <button
          className='border border-brand-component-stroke-negative rounded-lg p-2'
          onClick={handleDeleteSelected}
        >
          <Trash width={16} height={16} className='text-brand-icon-negative' />
        </button>
      </div>
    </div>
  );
};

export default memo(BulkSelectionToolbar);
