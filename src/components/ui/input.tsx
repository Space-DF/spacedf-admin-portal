import { Eye, EyeOff, X } from 'lucide-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: JSX.Element;
  endAdornment?: JSX.Element;
  isError?: boolean;
}

const readOnlyClasses =
  'read-only:cursor-default read-only:bg-brand-component-fill-disabled read-only:text-brand-component-text-dark';

/** Shared so non-`Input` fields (e.g. contenteditable) can match the same focus treatment. */
export const inputFocusRingClasses =
  'focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:!ring-offset-0 focus:ring-[color:color-mix(in_srgb,hsl(var(--primary))_40%,transparent)]';

const errorClasses =
  'ring-1 ring-red-600 ring-offset-1 focus:ring-1 focus:ring-red-600 focus:ring-offset-1 focus:border-red-600 bg-brand-component-fill-negative-soft';

/** Forms mark invalid fields with `aria-invalid`, so the error state comes for free. */
const resolveIsError = (isError: boolean | undefined, ariaInvalid: unknown) =>
  isError ?? (ariaInvalid === true || ariaInvalid === 'true');

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, startAdornment, endAdornment, isError, ...props },
    ref,
  ) => {
    const hasAdornment = Boolean(startAdornment) || Boolean(endAdornment);
    const hasError = resolveIsError(isError, props['aria-invalid']);
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
              'flex h-9 items-center justify-center gap-2 rounded-md focus:ring-1 focus:ring-primary border-brand-stroke-dark-soft bg-brand-component-fill-light px-3 ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2 focus-visible:ring-ring data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 dark:bg-brand-heading dark:ring-brand-stroke-outermost',
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
                'flex h-full w-full rounded-md placeholder:text-brand-component-text-gray-fixed border bg-brand-component-fill-light py-2 text-sm shadow-none outline-none file:bg-transparent file:text-sm file:font-medium focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none',
                readOnlyClasses,
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
              'flex h-9 w-full rounded-xl border border-brand-stroke-dark-soft bg-brand-component-fill-light px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-component-text-gray-fixed disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-heading dark:text-white dark:ring-brand-stroke-outermost',
              inputFocusRingClasses,
              readOnlyClasses,
              className,
              hasError && errorClasses,
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
      <div
        className={cn(
          'relative flex max-w-2xl items-center focus:ring-1 focus:ring-primary',
          wrapperClass,
        )}
      >
        <div className='absolute left-2 top-1/2 -translate-y-1/2 transform text-brand-text-gray'>
          {prefixCpn}
        </div>
        <Input
          className={cn(
            'h-9 rounded-xl border bg-brand-component-fill-light pl-8 shadow-none',
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

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'type'> & {
    wrapperClassName?: string;
    toggleLabel?: string;
  }
>(
  (
    {
      className,
      wrapperClassName,
      toggleLabel = 'Toggle password visibility',
      disabled,
      isError,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const hasError = resolveIsError(isError, props['aria-invalid']);

    return (
      <div
        className={cn(
          'flex h-9 w-full items-center gap-2 rounded-xl border border-brand-component-stroke-dark-soft bg-brand-component-fill-light pl-3 pr-0.5 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
          'focus-within:border-[hsl(var(--primary))] focus-within:outline-none focus-within:ring-2 focus-within:!ring-offset-0 focus-within:ring-[color:color-mix(in_srgb,hsl(var(--primary))_40%,transparent)]',
          wrapperClassName,
          hasError &&
            'bg-brand-component-fill-negative-soft ring-1 ring-red-600 ring-offset-1 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600 focus-within:ring-offset-1',
        )}
        data-disabled={disabled}
      >
        <input
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          disabled={disabled}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-[14px] font-medium text-brand-component-text-dark outline-none placeholder:text-brand-component-text-gray disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
        <button
          type='button'
          tabIndex={-1}
          aria-label={toggleLabel}
          disabled={disabled}
          onClick={() => setIsVisible((visible) => !visible)}
          className='flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-brand-component-stroke-dark-soft bg-brand-component-fill-light text-brand-component-text-dark shadow-button-base transition-colors hover:bg-brand-component-hover-light disabled:cursor-not-allowed'
        >
          {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
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
      className='flex duration-150 transition-all flex-nowrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-brand-component-fill-light'
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
        className='flex-1 min-w-52 focus:ring-0 focus:ring-offset-0 shadow-none outline-none border-0 focus:outline-none bg-brand-component-fill-light focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-5 text-sm'
      />
    </div>
  );
}

Input.displayName = 'Input';
InputWithIcon.displayName = 'InputWithIcon';
PasswordInput.displayName = 'PasswordInput';
TagInput.displayName = 'TagInput';

export { Input, InputWithIcon, PasswordInput, TagInput };
