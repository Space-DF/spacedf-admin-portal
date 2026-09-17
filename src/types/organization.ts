export type OrganizationPlan = 'free' | 'pro';

export type SubscriptionStatus = 'active' | 'expiring' | 'expired';

export interface Organization {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  logo: string;
  slug_name: string;
  is_active: boolean;
  oauth2_redirect_uris: string;
  template: string;
  total_member: number;
  total_spaces: number;
  created_by: string;
  plan?: OrganizationPlan;
  period_start?: string;
  period_end?: string;
}

export interface OrganizationThemeColors {
  text: string;
  input: string;
  primary: string;
  primary_text: string;
  secondary: string;
  secondary_text: string;
  accent: string;
  accent_text: string;
  background: string;
  border: string;
  support_text: string;
  card: string;
  switch_background: string;
  input_border: string;
}

export interface OrganizationTheme {
  id: string;
  theme_key: string;
  theme_colors: OrganizationThemeColors;
  url_logo: string | null;
  url_favicon: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationBorderRadius {
  card: number;
  input: number;
  button: number;
}

export interface OrganizationSetting {
  id: string;
  site_title: string;
  site_description: string;
  theme_mode: string;
  border_radius: OrganizationBorderRadius;
  themes: OrganizationTheme[];
  brand_name: string;
  updated_at: string;
}

export interface CheckOrganizationResponse {
  result: string;
  template: string;
  setting: OrganizationSetting;
}
