import { Facebook, Instagram, Linkedin, Tiktok } from '@/components/icons';

export const DEFAULT_DOMAIN = 'yourdomain.com';

export const SOCIAL_LINKS = [
  { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
  { key: 'facebook' as const, label: 'Facebook', icon: Facebook },
  { key: 'instagram' as const, label: 'Instagram', icon: Instagram },
  { key: 'tiktok' as const, label: 'TikTok', icon: Tiktok },
];
