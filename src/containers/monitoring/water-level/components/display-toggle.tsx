import { type Control } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { type WaterLevelFormValues } from '@/containers/monitoring/water-level/schema';

interface Props {
  control: Control<WaterLevelFormValues>;
  name: `display.${keyof WaterLevelFormValues['display']}`;
  label: string;
  description: string;
}

export const DisplayToggle = ({ control, name, label, description }: Props) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className='flex items-center gap-x-1.5 space-y-0'>
        <div className='flex min-w-0 flex-1 flex-col gap-y-1'>
          <FormLabel>{label}</FormLabel>
          <FormDescription className='text-body font-normal text-brand-component-text-gray'>
            {description}
          </FormDescription>
        </div>
        <FormControl>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </FormControl>
      </FormItem>
    )}
  />
);
