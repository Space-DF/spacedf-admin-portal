import { NEXT_PUBLIC_AUTH_API } from '@/shared/env';

export const uppercaseFirstLetter = (originalString: string) => {
  if (!originalString) return '';
  const fistLetterUppercase = originalString.substring(0, 1).toUpperCase();
  const resString = originalString.substring(1, originalString.length);

  return fistLetterUppercase + resString;
};

export const generateOrganizationDomain = (organizationName: string) => {
  if (!organizationName) return '';
  return organizationName?.replaceAll(' ', '').toLowerCase();
};

export function getSubdomain(fullUrl: string) {
  const envDomain = ['localhost', 'develop'];
  const prodDomain = ['danang', 'spacedf'];

  if (envDomain.some((domain) => fullUrl.includes(domain))) return 'develop';

  if (prodDomain.some((domain) => fullUrl.includes(domain))) return 'danang';

  return '';
}

export const truncateText = (
  text?: string,
  maxLength = 20,
  fallback = '------',
) => {
  if (!text) return fallback;
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const getOrganizationApiUrl = (slugName: string): string => {
  if (!slugName) return '';

  try {
    const url = new URL(NEXT_PUBLIC_AUTH_API);
    const hostname = url.hostname;
    const newHostname = `${slugName}.${hostname}`;
    url.hostname = newHostname;
    return url.toString();
  } catch {
    return NEXT_PUBLIC_AUTH_API.replace(
      'https://api.',
      `https://${slugName}.api.`,
    );
  }
};
