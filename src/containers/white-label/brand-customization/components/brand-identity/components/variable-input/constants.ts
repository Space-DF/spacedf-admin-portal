export const BRAND_NAME_VARIABLE = '{Brand Name}';
export const VARIABLE_REGEX = /(\{Brand Name\})/gi;
export const CHIP_CLASS =
  'variable-chip inline-flex items-center text-brand-component-text-secondary font-semibold leading-none p-0.5 rounded align-baseline select-all cursor-default whitespace-nowrap transition-colors duration-150 hover:bg-[#4006AA1A]';

export const VARIABLES = [
  {
    value: 'Brand Name',
    labelKey: 'brand_name' as const,
    descriptionKey: 'variable_brand_name_description' as const,
  },
];
