import {
  BRAND_NAME_VARIABLE,
  CHIP_CLASS,
  VARIABLE_REGEX,
} from '@/containers/white-label/brand-customization/components/brand-identity/components/variable-input/constants';

/**
 * Serialize contentEditable DOM back to a plain string.
 * Variable chips (span[data-variable]) become `{Brand Name}`,
 * <br> and block boundaries become `\n`, everything else is text.
 */
export function serializeNodes(container: HTMLElement): string {
  if (
    container.textContent === '' &&
    !container.querySelector('span[data-variable]')
  ) {
    return '';
  }

  let result = '';

  const walk = (node: Node, isFirstChild: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? '';
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;

    // Variable chip
    if (el.dataset.variable) {
      result += BRAND_NAME_VARIABLE;
      return;
    }

    // <br>
    if (el.tagName === 'BR') {
      result += '\n';
      return;
    }

    // Block-level elements (div, p) — add newline before unless first child
    const isBlock = el.tagName === 'DIV' || el.tagName === 'P';
    if (isBlock && !isFirstChild && el.textContent !== '') {
      result += '\n';
    }

    const children = el.childNodes;
    children.forEach((child, i) => walk(child, i === 0));
  };

  const children = container.childNodes;
  children.forEach((child, i) => walk(child, i === 0));

  return result;
}

/**
 * Build the innerHTML from the raw value string.
 * Splits by variable regex and renders chips for variables.
 */
export function buildHtml(value: string): string {
  if (!value) return '';

  const parts = value.split(VARIABLE_REGEX);

  return parts
    .map((part) => {
      if (VARIABLE_REGEX.test(part)) {
        // Reset lastIndex since we use the `g` flag
        VARIABLE_REGEX.lastIndex = 0;
        return `<span data-variable="Brand Name" contenteditable="false" class="${CHIP_CLASS}">${part}</span>`;
      }
      // Escape HTML and convert newlines to <br>
      return part
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    })
    .join('');
}

/**
 * Place caret at the end of the contentEditable element.
 */
export function placeCaretAtEnd(el: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Compute the character offset in the plain text representation
 * up to the targetNode and targetOffset in the DOM.
 */
function getSerializedOffset(
  container: HTMLElement,
  targetNode: Node,
  targetOffset: number,
): number {
  let offset = 0;
  let found = false;

  const walk = (node: Node) => {
    if (found) return;

    if (node === targetNode) {
      if (node.nodeType === Node.TEXT_NODE) {
        offset += targetOffset;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const children = node.childNodes;
        for (let i = 0; i < targetOffset; i++) {
          if (i < children.length) {
            const child = children[i];
            if (child.nodeType === Node.TEXT_NODE) {
              offset += child.textContent?.length ?? 0;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const el = child as HTMLElement;
              if (el.dataset.variable) {
                offset += BRAND_NAME_VARIABLE.length;
              } else if (el.tagName === 'BR') {
                offset += 1;
              } else {
                offset += el.textContent?.length ?? 0;
              }
            }
          }
        }
      }
      found = true;
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      offset += node.textContent?.length ?? 0;
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.dataset.variable) {
        offset += BRAND_NAME_VARIABLE.length;
        return;
      }
      if (el.tagName === 'BR') {
        offset += 1;
        return;
      }
    }

    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      walk(children[i]);
      if (found) return;
    }
  };

  walk(container);
  return offset;
}

/**
 * Set the cursor caret position in the DOM tree based on a character offset.
 */
function setSelectionAtSerializedOffset(
  container: HTMLElement,
  targetOffset: number,
) {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  let currentOffset = 0;
  let found = false;

  const walk = (node: Node) => {
    if (found) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length ?? 0;
      if (
        targetOffset >= currentOffset &&
        targetOffset <= currentOffset + len
      ) {
        range.setStart(node, targetOffset - currentOffset);
        range.collapse(true);
        found = true;
        return;
      }
      currentOffset += len;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.dataset.variable) {
        const len = BRAND_NAME_VARIABLE.length;
        if (
          targetOffset >= currentOffset &&
          targetOffset <= currentOffset + len
        ) {
          const parent = el.parentNode;
          if (parent) {
            const index = Array.from(parent.childNodes).indexOf(el);
            range.setStart(
              parent,
              index + (targetOffset - currentOffset <= len / 2 ? 0 : 1),
            );
            range.collapse(true);
            found = true;
          }
          return;
        }
        currentOffset += len;
      } else if (el.tagName === 'BR') {
        const len = 1;
        if (
          targetOffset >= currentOffset &&
          targetOffset <= currentOffset + len
        ) {
          const parent = el.parentNode;
          if (parent) {
            range.setStart(parent, Array.from(parent.childNodes).indexOf(el));
            range.collapse(true);
            found = true;
          }
          return;
        }
        currentOffset += len;
      } else {
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
          walk(children[i]);
          if (found) return;
        }
      }
    }
  };

  walk(container);

  if (!found) {
    range.selectNodeContents(container);
    range.collapse(false);
  }

  selection.removeAllRanges();
  selection.addRange(range);
}

export function saveSelection(
  container: HTMLElement,
): { start: number; end: number } | null {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!container.contains(range.startContainer)) return null;

  return {
    start: getSerializedOffset(
      container,
      range.startContainer,
      range.startOffset,
    ),
    end: getSerializedOffset(container, range.endContainer, range.endOffset),
  };
}

export function restoreSelection(
  container: HTMLElement,
  savedSel: { start: number; end: number } | null,
) {
  if (!savedSel) return;
  setSelectionAtSerializedOffset(container, savedSel.start);
}

/**
 * Walk the DOM to find typed brandName values or {brandName} strings
 * and replace them in-place with variable chip elements.
 */
export function autoConvertTextToChips(
  container: HTMLElement,
  brandName: string,
): boolean {
  if (!brandName) return false;

  const selection = window.getSelection();
  let savedOffset = -1;
  const isFocused = document.activeElement === container;

  if (isFocused && selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (container.contains(range.startContainer)) {
      savedOffset = getSerializedOffset(
        container,
        range.startContainer,
        range.startOffset,
      );
    }
  }

  let mutated = false;
  const escapedBrand = brandName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(
    `(\\{Brand Name\\}|(?<![a-zA-Z0-9_])${escapedBrand}(?![a-zA-Z0-9_]))`,
    'g',
  );

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';

      regex.lastIndex = 0;
      const match = regex.exec(text);
      if (match) {
        const matchIndex = match.index;
        const matchText = match[0];
        const matchLength = matchText.length;

        const beforeText = text.substring(0, matchIndex);
        const afterText = text.substring(matchIndex + matchLength);

        const parent = node.parentNode;
        if (parent) {
          const beforeNode = document.createTextNode(beforeText);
          const chipNode = document.createElement('span');
          chipNode.setAttribute('data-variable', 'Brand Name');
          chipNode.setAttribute('contenteditable', 'false');
          chipNode.className = CHIP_CLASS;
          chipNode.textContent = BRAND_NAME_VARIABLE;

          const afterNode = document.createTextNode(afterText);

          parent.replaceChild(afterNode, node);
          parent.insertBefore(chipNode, afterNode);
          parent.insertBefore(beforeNode, chipNode);

          mutated = true;

          if (savedOffset !== -1) {
            const originalLength = matchLength;
            const newLength = BRAND_NAME_VARIABLE.length;
            const matchStartOffset = getSerializedOffset(
              container,
              beforeNode,
              beforeNode.length,
            );

            if (savedOffset >= matchStartOffset + originalLength) {
              savedOffset += newLength - originalLength;
            } else if (
              savedOffset > matchStartOffset &&
              savedOffset < matchStartOffset + originalLength
            ) {
              savedOffset = matchStartOffset + newLength;
            }
          }

          walk(afterNode);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.dataset.variable) return;

      const children = Array.from(node.childNodes);
      for (let i = 0; i < children.length; i++) {
        walk(children[i]);
      }
    }
  };

  walk(container);

  if (mutated && isFocused && savedOffset !== -1) {
    setSelectionAtSerializedOffset(container, savedOffset);
  }

  return mutated;
}

/**
 * Helper to delete a variable chip node, restore range focus,
 * update history, and call the parent onChange handler.
 */
export function deleteChipNode(
  el: HTMLElement,
  nodeToDelete: HTMLElement,
  selection: Selection,
  pushHistory: (
    newValue: string,
    caret: { start: number; end: number } | null,
    isTyping: boolean,
  ) => void,
  onChange: (value: string) => void,
  lastValueRef?: React.MutableRefObject<string | undefined>,
) {
  const newRange = document.createRange();
  newRange.setStartBefore(nodeToDelete);
  newRange.collapse(true);
  nodeToDelete.remove();
  selection.removeAllRanges();
  selection.addRange(newRange);

  const newValue = serializeNodes(el);
  const caret = saveSelection(el);
  pushHistory(newValue, caret, false);
  if (lastValueRef) {
    lastValueRef.current = newValue;
  }
  onChange(newValue);
}
