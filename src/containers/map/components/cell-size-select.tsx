import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CELL_SIZE_RESOLUTIONS } from '@/containers/map/utils';

export const CELL_SIZE_LABEL_KEY: Record<number, string> = {
  8: 'cell_size_very_large',
  9: 'cell_size_large',
  10: 'cell_size_medium',
  11: 'cell_size_small',
  12: 'cell_size_very_small',
  13: 'cell_size_ultra_small',
};

interface Props {
  value: number;
  onChange: (resolution: number) => void;
}

export const CellSizeSelect = ({ value, onChange }: Props) => {
  const t = useTranslations('monitoring');

  return (
    <Select
      value={String(value)}
      onValueChange={(next) => onChange(Number(next))}
    >
      <SelectTrigger className='h-9 rounded-xl border-brand-component-stroke-dark-soft font-medium'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CELL_SIZE_RESOLUTIONS.map((resolution) => (
          <SelectItem key={resolution} value={String(resolution)}>
            <span className='text-brand-component-text-dark'>
              {t(CELL_SIZE_LABEL_KEY[resolution])}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
