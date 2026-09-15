import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface Props {
  fieldValue?: string;
  onValueChange?: (value: string) => void;
}

const SelectColor = ({ fieldValue, onValueChange }: Props) => {
  const t = useTranslations('common');

  const [localValue, setLocalValue] = useState(fieldValue);

  useEffect(() => {
    setLocalValue(fieldValue);
  }, [fieldValue]);

  const callbackRef = useRef(onValueChange);
  useEffect(() => {
    callbackRef.current = onValueChange;
  });

  const timerRef = useRef<NodeJS.Timeout>();

  const debouncedValueChange = useCallback((val: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      callbackRef.current?.(val);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type='button'
      onClick={() => inputRef.current?.click()}
      className='relative flex h-9 w-full items-center rounded-xl border border-brand-component-stroke-dark-soft bg-transparent px-3 dark:bg-brand-heading'
    >
      {localValue ? (
        <div className='flex items-center space-x-2'>
          <div
            className={cn('h-4 w-4 rounded-full')}
            style={{
              backgroundColor: `#${localValue}`,
            }}
          />
          <p className='text-brand-component-text-dark'>{localValue}</p>
        </div>
      ) : (
        <span className='text-brand-component-text-gray'>
          {t('select_color')}
        </span>
      )}
      <input
        type='color'
        ref={inputRef}
        value={localValue ? `#${localValue}` : '#ffffff'}
        onChange={(e) => {
          const newColor = e.target.value.replace('#', '').toUpperCase();
          setLocalValue(newColor);
          debouncedValueChange(newColor);
        }}
        className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
        tabIndex={-1}
      />
    </button>
  );
};

export default SelectColor;
