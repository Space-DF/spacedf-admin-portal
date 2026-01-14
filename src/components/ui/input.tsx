import { X } from 'lucide-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: JSX.Element;
  endAdornment?: JSX.Element;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startAdornment, endAdornment, ...props }, ref) => {
    const hasAdornment = Boolean(startAdornment) || Boolean(endAdornment);
    return (
      // <input
      //   type={type}
      //   className={cn(
      //     "flex h-9 w-full rounded-lg border bg-brand-fill-dark-soft dark:bg-brand-heading border-brand-stroke-dark-soft px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:ring-brand-stroke-outermost disabled:cursor-not-allowed disabled:opacity-50 dark:text-white",
      //     props["aria-invalid"] && "!ring-red-500 border",
      //     className
      //   )}
      //   ref={ref}
      //   {...props}
      // />
      <>
        {hasAdornment ? (
          <div
            className={cn(
              'flex h-9 items-center justify-center gap-2 rounded-md border-brand-stroke-dark-soft bg-brand-fill-dark-soft px-3 ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2 focus-visible:ring-ring data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 dark:bg-brand-heading dark:ring-brand-stroke-outermost',
              className,
            )}
            data-disabled={props.disabled}
          >
            {startAdornment && (
              <div className={cn('text-muted-foreground')}>
                {startAdornment}
              </div>
            )}
            <input
              type={type}
              className={cn(
                'flex h-full w-full rounded-md border-none bg-transparent py-2 text-sm shadow-none outline-none file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none',
              )}
              ref={ref}
              {...props}
            />
            {endAdornment && (
              <div className={cn('text-muted-foreground')}>{endAdornment}</div>
            )}
          </div>
        ) : (
          <input
            type={type}
            className={cn(
              'flex h-9 w-full outline-none rounded-lg border border-brand-stroke-dark-soft bg-brand-fill-dark-soft px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-heading dark:text-white dark:ring-brand-stroke-outermost',
              className,
            )}
            ref={ref}
            {...props}
          />
        )}
      </>
    );
  },
);

const InputWithIcon = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    prefixCpn?: React.ReactNode;
    suffixCpn?: React.ReactNode;
    wrapperClass?: string;
  }
>(
  (
    { className, type, prefixCpn, suffixCpn, wrapperClass = '', ...props },
    ref,
  ) => {
    return (
      <div className={cn('relative flex max-w-2xl items-center', wrapperClass)}>
        <div className='absolute left-2 top-1/2 -translate-y-1/2 transform text-brand-text-gray'>
          {prefixCpn}
        </div>
        <Input
          className={cn(
            'h-10 rounded-lg border-none bg-brand-fill-dark-soft pl-8 shadow-none',
            {
              'pr-8': !!suffixCpn,
            },
            className,
          )}
          type={type}
          ref={ref}
          {...props}
        />
        <div className='absolute right-2 top-1/2 -translate-y-1/2 transform text-brand-text-gray'>
          {suffixCpn}
        </div>
      </div>
    );
  },
);

interface TagInputProps {
  placeholder?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  maxTags?: number;
}

function TagInput({
  placeholder = 'Add tag...',
  value = [],
  onChange,
  disabled = false,
  maxTags = Number.POSITIVE_INFINITY,
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(value);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTags(value);
  }, [value]);

  const handleTagChange = (newTags: string[]) => {
    setTags(newTags);
    onChange?.(newTags);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !!inputValue.trim()) {
      e.preventDefault();
      if (tags.length >= maxTags) return;

      if (!tags.includes(inputValue.trim())) {
        handleTagChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      handleTagChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    handleTagChange(tags.filter((_, i) => i !== index));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className='flex duration-150 transition-all flex-nowrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-background bg-brand-fill-dark-soft'
      onClick={handleContainerClick}
    >
      {tags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          className='h-5 px-2 text-sm rounded-md text-nowrap'
        >
          {tag}
          <button
            type='button'
            className='ml-1 rounded-md outline-none focus:ring-2 focus:ring-ring '
            onClick={() => removeTag(index)}
          >
            <X className='h-3 w-3' />
            <span className='sr-only'>Remove {tag} tag</span>
          </button>
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        disabled={disabled || tags.length >= maxTags}
        className='flex-1 min-w-52 focus:ring-0 focus:ring-offset-0 shadow-none outline-none border-0 focus:outline-none bg-brand-fill-dark-soft focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-5 text-sm'
      />
    </div>
  );
}

Input.displayName = 'Input';
InputWithIcon.displayName = 'InputWithIcon';
TagInput.displayName = 'TagInput';

export { Input, InputWithIcon, TagInput };
