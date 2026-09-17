export type CustomPageType =
  | 'sign_in'
  | 'sign_up'
  | 'forget_password'
  | 'change_password';

export interface CustomPageThemeColors {
  background_color?: string;
}

export interface CustomPage {
  id: string;
  page_type: CustomPageType;
  title: string;
  subtitle: string;
  metadata: Record<string, unknown>;
  theme_colors: CustomPageThemeColors;
  url_background_image?: string;
  show_logo: boolean;
  created_at: string;
  updated_at: string;
}
