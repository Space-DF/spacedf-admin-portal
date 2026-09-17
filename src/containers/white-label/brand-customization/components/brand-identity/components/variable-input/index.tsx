'use client';

import { Braces } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useCallback } from 'react';

import { cn } from '@/lib/utils';

import { inputFocusRingClasses } from '@/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { VARIABLES } from '@/containers/white-label/brand-customization/components/brand-identity/components/variable-input/constants';
import { useVariableInput } from '@/containers/white-label/brand-customization/components/brand-identity/components/variable-input/hooks/useVariableInput';

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  brandName?: string;
}

export const VariableInput = React.forwardRef<
  HTMLDivElement,
  VariableInputProps
>(
  (
    {
      value,
      onChange,
      placeholder,
      className,
      multiline = false,
      onBlur,
      disabled,
      brandName,
    },
    ref,
  ) => {
    const t = useTranslations('white-label');

    const {
      localRef,
      handleInput,
      handlePaste,
      handleCompositionStart,
      handleCompositionEnd,
      dropdownState,
      setDropdownState,
      selectedIndex,
      insertVariable,
      handleKeyDown,
      handleKeyUp,
      handleMouseUp,
      tooltipState,
      handleMouseOver,
      handleMouseLeave,
    } = useVariableInput({ value, onChange, brandName, multiline });

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && typeof ref === 'object') {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref, localRef],
    );

    const filtered = dropdownState ? VARIABLES : [];

    return (
      <TooltipProvider delayDuration={200}>
        <div className='relative'>
          <div
            ref={setRefs}
            contentEditable={!disabled}
            suppressContentEditableWarning
            role='textbox'
            aria-multiline={multiline}
            aria-placeholder={placeholder}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onMouseUp={handleMouseUp}
            onPaste={handlePaste}
            onBlur={onBlur}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            className={cn(
              'w-full rounded-lg px-3 py-2 text-sm leading-normal outline-none break-words border border-brand-component-stroke-dark-soft whitespace-pre-wrap transition-shadow relative',
              inputFocusRingClasses,
              multiline
                ? 'min-h-[6rem] resize-none font-normal'
                : 'min-h-[2.25rem] font-medium',
              className,
            )}
            data-placeholder={placeholder}
          />
          <Popover
            open={dropdownState !== null && filtered.length > 0}
            onOpenChange={(open) => {
              if (!open) setDropdownState(null);
            }}
            modal={false}
          >
            <PopoverAnchor asChild>
              <span
                style={{
                  position: 'absolute',
                  top: `${dropdownState ? dropdownState.coords.top : 0}px`,
                  left: `${dropdownState ? dropdownState.coords.left : 0}px`,
                  width: '1px',
                  height: '1px',
                  visibility: 'hidden',
                }}
              />
            </PopoverAnchor>
            {dropdownState && filtered.length > 0 && (
              <PopoverContent
                className='w-52 p-1'
                align='start'
                sideOffset={4}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <span className='ml-1.5 text-brand-component-text-gray font-medium text-xs'>
                  Variables
                </span>
                {filtered.map((item, index) => (
                  <Tooltip key={item.value}>
                    <TooltipTrigger asChild>
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault(); // prevent input blur on click
                          insertVariable(item.value, dropdownState.range);
                        }}
                        className={cn(
                          'cursor-pointer flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-sm transition-colors select-none w-full',
                          index === selectedIndex
                            ? 'bg-accent text-brand-component-text-dark'
                            : 'hover:bg-accent/50 text-foreground',
                        )}
                      >
                        <Braces size={16} /> {t(item.labelKey)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      align='center'
                      className='max-w-xs leading-relaxed text-brand-component-text-light text-xs'
                    >
                      {t(item.descriptionKey)}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </PopoverContent>
            )}
          </Popover>

          <Tooltip open={tooltipState !== null}>
            <TooltipTrigger asChild>
              <span
                style={{
                  position: 'absolute',
                  top: `${tooltipState ? tooltipState.coords.top : 0}px`,
                  left: `${tooltipState ? tooltipState.coords.left : 0}px`,
                  width: '1px',
                  height: '1px',
                  visibility: 'hidden',
                }}
              />
            </TooltipTrigger>
            {tooltipState &&
              (() => {
                const variableObj = VARIABLES.find(
                  (v) =>
                    v.value.toLowerCase() ===
                      tooltipState.variableValue.toLowerCase() ||
                    v.value.replace(/\s+/g, '').toLowerCase() ===
                      tooltipState.variableValue.toLowerCase(),
                );
                return variableObj ? (
                  <TooltipContent
                    side='top'
                    align='center'
                    className='max-w-xs p-3 flex flex-col gap-1 text-brand-component-text-light text-xs z-50'
                  >
                    <span className='font-semibold text-white'>{`{${tooltipState.variableValue}}`}</span>
                    <span className='leading-normal text-brand-component-text-light/90'>
                      {t(variableObj.descriptionKey)}
                    </span>
                  </TooltipContent>
                ) : null;
              })()}
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  },
);

VariableInput.displayName = 'VariableInput';
