const EUI_BYTE_LENGTH = 8;

const groupHexPairs = (hex: string) => hex.match(/.{1,2}/g)?.join(' ') ?? '';

export const formatValueEUI = (value?: string) => {
  if (!value) return '-';
  return groupHexPairs(value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase());
};

export function countTwoDigitNumbers(str?: string) {
  if (!str) return 0;
  const numbers = str.split(' ');
  return numbers.filter((num) => num.length === 2).length;
}

export const normalizeEUIInput = (value: string) => {
  const hexOnly = value.replace(/\s/g, '').toUpperCase();
  if (!/^[0-9A-F]*$/.test(hexOnly) || hexOnly.length > EUI_BYTE_LENGTH * 2) {
    return null;
  }
  return groupHexPairs(hexOnly);
};
