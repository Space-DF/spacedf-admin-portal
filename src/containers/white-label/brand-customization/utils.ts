export const resolveBrandNameVariable = (
  text: string,
  brandNameValue?: string,
) => {
  if (!text) return '';
  const replacement = brandNameValue || '';
  return text.replace(/\{Brand Name\}/gi, replacement);
};

export const replaceWithBrandNameVariable = (
  text: string,
  brandNameValue?: string,
) => {
  if (!text) return '';
  if (!brandNameValue) return text;
  const escapedBrand = brandNameValue.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(
    `(?<![a-zA-Z0-9_])${escapedBrand}(?![a-zA-Z0-9_])`,
    'gi',
  );
  return text.replace(regex, '{Brand Name}');
};
