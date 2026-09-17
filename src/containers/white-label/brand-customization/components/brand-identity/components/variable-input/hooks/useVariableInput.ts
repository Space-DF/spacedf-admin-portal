import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  BRAND_NAME_VARIABLE,
  CHIP_CLASS,
  VARIABLE_REGEX,
  VARIABLES,
} from '../constants';
import {
  autoConvertTextToChips,
  buildHtml,
  deleteChipNode,
  placeCaretAtEnd,
  restoreSelection,
  saveSelection,
  serializeNodes,
} from '../utils';

interface HistoryEntry {
  value: string;
  caret: { start: number; end: number } | null;
}

export const useVariableInput = ({
  value,
  onChange,
  brandName,
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  brandName?: string;
  multiline?: boolean;
}) => {
  const localRef = useRef<HTMLDivElement | null>(null);
  const isComposingRef = useRef(false);

  const lastValueRef = useRef<string | undefined>(undefined);
  const lastBrandNameRef = useRef<string | undefined>(undefined);

  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const lastPushTimeRef = useRef<number>(0);

  const [dropdownState, setDropdownStateRaw] = useState<{
    query: string;
    range: Range;
    coords: { top: number; left: number };
  } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [tooltipState, setTooltipState] = useState<{
    variableValue: string;
    coords: { top: number; left: number };
  } | null>(null);

  const setDropdownState = useCallback((state: typeof dropdownState) => {
    setDropdownStateRaw(state);
    if (state) {
      setTooltipState(null);
    }
  }, []);

  const getElement = useCallback((): HTMLDivElement | null => {
    return localRef.current;
  }, []);

  const pushHistory = useCallback(
    (
      newValue: string,
      caret: { start: number; end: number } | null,
      isTyping = false,
    ) => {
      const now = Date.now();
      const nextHistory = historyRef.current.slice(
        0,
        historyIndexRef.current + 1,
      );

      const lastEntry = nextHistory[nextHistory.length - 1];
      if (lastEntry && lastEntry.value === newValue) {
        return;
      }

      if (isTyping && lastEntry && now - lastPushTimeRef.current < 1500) {
        lastEntry.value = newValue;
        lastEntry.caret = caret;
        historyRef.current = nextHistory;
        historyIndexRef.current = nextHistory.length - 1;
        lastPushTimeRef.current = now;
        return;
      }

      nextHistory.push({ value: newValue, caret });
      if (nextHistory.length > 100) {
        nextHistory.shift();
      }
      historyRef.current = nextHistory;
      historyIndexRef.current = nextHistory.length - 1;
      lastPushTimeRef.current = now;
    },
    [],
  );

  const resetHistory = useCallback(
    (newValue: string, caret: { start: number; end: number } | null) => {
      historyRef.current = [{ value: newValue, caret }];
      historyIndexRef.current = 0;
      lastPushTimeRef.current = Date.now();
    },
    [],
  );

  // Initialize history
  useEffect(() => {
    if (historyIndexRef.current === -1 && value !== undefined) {
      historyRef.current = [{ value, caret: null }];
      historyIndexRef.current = 0;
    }
  }, [value]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const entry = historyRef.current[historyIndexRef.current];

      const el = getElement();
      if (el) {
        el.innerHTML = buildHtml(entry.value) || '';
        if (entry.caret) {
          restoreSelection(el, entry.caret);
        } else {
          placeCaretAtEnd(el);
        }
      }
      lastValueRef.current = entry.value;
      onChange(entry.value);
    }
  }, [getElement, onChange]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const entry = historyRef.current[historyIndexRef.current];

      const el = getElement();
      if (el) {
        el.innerHTML = buildHtml(entry.value) || '';
        if (entry.caret) {
          restoreSelection(el, entry.caret);
        } else {
          placeCaretAtEnd(el);
        }
      }
      lastValueRef.current = entry.value;
      onChange(entry.value);
    }
  }, [getElement, onChange]);

  // Sync external value or brandName → DOM
  useEffect(() => {
    const el = getElement();
    if (!el) return;

    const isInitial = lastValueRef.current === undefined;

    if (isInitial) {
      lastValueRef.current = value;
    }
    if (lastBrandNameRef.current === undefined) {
      lastBrandNameRef.current = brandName;
    }

    const valueChanged = lastValueRef.current !== value;
    const brandNameChanged = lastBrandNameRef.current !== brandName;

    if (isInitial || valueChanged || brandNameChanged) {
      const wasFocused = document.activeElement === el;
      el.innerHTML = buildHtml(value) || '';
      if (brandName) {
        autoConvertTextToChips(el, brandName);
      }
      if (wasFocused) {
        placeCaretAtEnd(el);
      }
      if (isInitial || valueChanged) {
        // external/programmatic value (reset từ API) => baseline mới, bỏ undo stack cũ
        resetHistory(value, wasFocused ? saveSelection(el) : null);
      }
      // brandName-only change: giữ nguyên history của user
      lastValueRef.current = value;
      lastBrandNameRef.current = brandName;
    }
  }, [value, brandName, getElement, resetHistory]);

  const handleInput = useCallback(() => {
    setTooltipState(null);
    if (isComposingRef.current) return;
    const el = getElement();
    if (!el) return;

    const converted = brandName ? autoConvertTextToChips(el, brandName) : false;

    const newValue = serializeNodes(el);
    const caret = saveSelection(el);
    pushHistory(newValue, caret, !converted);
    lastValueRef.current = newValue;
    onChange(newValue);
  }, [onChange, getElement, pushHistory, brandName]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      if (!text) return;

      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      const parts = text.split(VARIABLE_REGEX);
      VARIABLE_REGEX.lastIndex = 0;

      let htmlToInsert = '';
      parts.forEach((part) => {
        if (VARIABLE_REGEX.test(part)) {
          VARIABLE_REGEX.lastIndex = 0;
          htmlToInsert += `<span data-variable="Brand Name" contenteditable="false" class="${CHIP_CLASS}">${BRAND_NAME_VARIABLE}</span>`;
        } else if (part) {
          const escaped = part
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
          htmlToInsert += escaped;
        }
      });

      const el = getElement();
      if (!el) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();
      const tempEl = document.createElement('div');
      tempEl.innerHTML = htmlToInsert;
      const fragment = document.createDocumentFragment();
      let lastInsertedNode: Node | null = null;
      while (tempEl.firstChild) {
        lastInsertedNode = tempEl.firstChild;
        fragment.appendChild(lastInsertedNode);
      }
      range.insertNode(fragment);

      if (lastInsertedNode) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastInsertedNode);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      if (brandName) {
        autoConvertTextToChips(el, brandName);
      }

      const newValue = serializeNodes(el);
      const newCaret = saveSelection(el);
      pushHistory(newValue, newCaret, false);
      lastValueRef.current = newValue;
      onChange(newValue);
    },
    [onChange, getElement, pushHistory, brandName],
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    handleInput();
  }, [handleInput]);

  const insertVariable = useCallback(
    (varName: string, range: Range) => {
      const el = getElement();
      if (!el) return;

      el.focus();

      const selection = window.getSelection();
      if (!selection) return;

      selection.removeAllRanges();
      selection.addRange(range);

      const htmlToInsert = `<span data-variable="${varName}" contenteditable="false" class="${CHIP_CLASS} temp-inserted-chip">{${varName}}</span>`;

      range.deleteContents();
      const tempEl = document.createElement('div');
      tempEl.innerHTML = htmlToInsert;
      const fragment = document.createDocumentFragment();
      while (tempEl.firstChild) {
        fragment.appendChild(tempEl.firstChild);
      }
      range.insertNode(fragment);

      setDropdownState(null);

      const insertedEl = el.querySelector(
        '.temp-inserted-chip',
      ) as HTMLElement | null;
      if (insertedEl) {
        insertedEl.classList.remove('temp-inserted-chip');
        const newRange = document.createRange();
        newRange.setStartAfter(insertedEl);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      el.focus();
      const newValue = serializeNodes(el);
      const caret = saveSelection(el);
      pushHistory(newValue, caret, false);
      lastValueRef.current = newValue;
      onChange(newValue);
    },
    [getElement, setDropdownState, pushHistory, onChange],
  );

  const checkTrigger = useCallback(() => {
    const el = getElement();
    if (!el) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      setDropdownState(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
      setDropdownState(null);
      return;
    }

    const { startContainer, startOffset } = range;
    if (startContainer.nodeType !== Node.TEXT_NODE) {
      setDropdownState(null);
      return;
    }

    const text = startContainer.textContent || '';
    const textBeforeCursor = text.slice(0, startOffset);

    const match = textBeforeCursor.match(/\/([^\s/]*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const filtered = VARIABLES;

      if (filtered.length > 0) {
        const index = match.index!;
        const triggerRange = document.createRange();
        triggerRange.setStart(startContainer, index);
        triggerRange.setEnd(startContainer, startOffset);

        const rects = triggerRange.getClientRects();
        const containerRect = el.getBoundingClientRect();
        let coords = { top: 0, left: 0 };
        if (rects.length > 0) {
          const rect = rects[0];
          coords = {
            top: rect.bottom - containerRect.top + el.scrollTop,
            left: rect.left - containerRect.left + el.scrollLeft,
          };
        }

        setDropdownState({
          query,
          range: triggerRange,
          coords,
        });
        setSelectedIndex((prev) => Math.min(prev, filtered.length - 1));
      } else {
        setDropdownState(null);
      }
    } else {
      setDropdownState(null);
    }
  }, [getElement, setDropdownState]);

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        dropdownState &&
        ['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(e.key)
      ) {
        return;
      }
      checkTrigger();
    },
    [checkTrigger, dropdownState],
  );

  const handleMouseUp = useCallback(() => {
    checkTrigger();
  }, [checkTrigger]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      setTooltipState(null);
      const el = getElement();
      if (!el) return;

      const isUndo = (e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey;
      const isRedo =
        ((e.metaKey || e.ctrlKey) && e.key === 'y') ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z');

      if (isUndo) {
        e.preventDefault();
        undo();
        return;
      }
      if (isRedo) {
        e.preventDefault();
        redo();
        return;
      }

      if (dropdownState) {
        const filtered = VARIABLES;

        if (filtered.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filtered.length);
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(
              (prev) => (prev - 1 + filtered.length) % filtered.length,
            );
            return;
          }
          if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            insertVariable(filtered[selectedIndex].value, dropdownState.range);
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            setDropdownState(null);
            return;
          }
        }
      }

      if (!multiline && e.key === 'Enter') {
        e.preventDefault();
        return;
      }

      if (e.key === 'Backspace') {
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;

        const range = selection.getRangeAt(0);
        if (!range.collapsed) return;

        const { startContainer, startOffset } = range;

        if (startContainer.nodeType === Node.TEXT_NODE && startOffset === 0) {
          const prev = startContainer.previousSibling as HTMLElement | null;
          if (prev?.dataset?.variable) {
            e.preventDefault();
            deleteChipNode(
              el,
              prev,
              selection,
              pushHistory,
              onChange,
              lastValueRef,
            );
            return;
          }
        }

        if (startContainer.nodeType === Node.ELEMENT_NODE) {
          const children = startContainer.childNodes;
          const prevNode = children[startOffset - 1] as HTMLElement | undefined;
          if (prevNode?.dataset?.variable) {
            e.preventDefault();
            deleteChipNode(
              el,
              prevNode,
              selection,
              pushHistory,
              onChange,
              lastValueRef,
            );
            return;
          }
        }
      }

      if (e.key === 'Delete') {
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;

        const range = selection.getRangeAt(0);
        if (!range.collapsed) return;

        const { startContainer, startOffset } = range;

        if (
          startContainer.nodeType === Node.TEXT_NODE &&
          startOffset === (startContainer.textContent?.length ?? 0)
        ) {
          const next = startContainer.nextSibling as HTMLElement | null;
          if (next?.dataset?.variable) {
            e.preventDefault();
            deleteChipNode(
              el,
              next,
              selection,
              pushHistory,
              onChange,
              lastValueRef,
            );
            return;
          }
        }

        if (startContainer.nodeType === Node.ELEMENT_NODE) {
          const children = startContainer.childNodes;
          const nextNode = children[startOffset] as HTMLElement | undefined;
          if (nextNode?.dataset?.variable) {
            e.preventDefault();
            deleteChipNode(
              el,
              nextNode,
              selection,
              pushHistory,
              onChange,
              lastValueRef,
            );
            return;
          }
        }
      }
    },
    [
      getElement,
      dropdownState,
      multiline,
      undo,
      redo,
      insertVariable,
      selectedIndex,
      setDropdownState,
      pushHistory,
      onChange,
    ],
  );

  const handleMouseOver = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const chip = target.closest('.variable-chip') as HTMLElement | null;
      const el = getElement();

      if (chip && el && el.contains(chip)) {
        const varName = chip.dataset.variable;
        if (varName) {
          const rect = chip.getBoundingClientRect();
          const containerRect = el.getBoundingClientRect();

          const top = rect.top - containerRect.top + el.scrollTop;
          const left =
            rect.left - containerRect.left + rect.width / 2 + el.scrollLeft;

          setTooltipState({
            variableValue: varName,
            coords: { top, left },
          });
        }
      } else {
        setTooltipState(null);
      }
    },
    [getElement],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltipState(null);
  }, []);

  return {
    localRef,
    lastValueRef,
    pushHistory,
    getElement,
    undo,
    redo,
    handleInput,
    handlePaste,
    handleCompositionStart,
    handleCompositionEnd,
    dropdownState,
    setDropdownState,
    selectedIndex,
    setSelectedIndex,
    insertVariable,
    handleKeyDown,
    handleKeyUp,
    handleMouseUp,
    tooltipState,
    handleMouseOver,
    handleMouseLeave,
  };
};
