export interface SocialLinks {
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
}

export interface CustomEmail {
  id: string;
  created_at: string;
  updated_at: string;
  sender_name: string;
  sender_email: string;
  footer_text: string;
  show_logo: boolean;
  social_links: SocialLinks;
  theme_colors: {
    background_color: string;
    primary_color: string;
  };
  metadata: {
    show_facebook: boolean;
    show_instagram: boolean;
    show_linkedin: boolean;
    show_tiktok: boolean;
  };
  url_header_image: string;
}
