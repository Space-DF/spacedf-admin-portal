import SelectColor from '@/components/common/select-color';

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (val: string) => void;
}

export const EmailColorPicker = ({
  label,
  value,
  onChange,
}: ColorPickerProps) => {
  const cleanHex = (c?: string) => {
    if (!c) return 'FFFFFF';
    return c.replace('#', '').toUpperCase();
  };

  const formatHex = (c: string) => {
    if (!c) return '#FFFFFF';
    return c.startsWith('#') ? c : `#${c}`;
  };

  return (
    <div className='space-y-1.5'>
      <label className='text-xs font-semibold text-brand-component-text-dark'>
        {label}
      </label>
      <SelectColor
        fieldValue={cleanHex(value)}
        onValueChange={(val) => onChange(formatHex(val))}
      />
    </div>
  );
};
