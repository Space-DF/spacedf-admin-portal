import { z } from 'zod';

import { resolveBrandNameVariable } from './utils';

export const brandIdentitySchema = z
  .object({
    brand_name: z
      .string({ required_error: 'please_enter_brand_name' })
      .trim()
      .min(1, { message: 'please_enter_brand_name' })
      .max(30, { message: 'brand_name_too_long' }),
    site_title: z
      .string()
      .trim()
      .min(1, { message: 'please_enter_website_title' }),
    site_description: z
      .string()
      .trim()
      .min(1, { message: 'please_enter_website_description' }),
    logoLight: z.any().nullable(),
    faviconLight: z.any().nullable(),
    faviconDark: z.any().nullable(),
  })
  .superRefine((data, ctx) => {
    const resolvedTitle = resolveBrandNameVariable(
      data.site_title,
      data.brand_name,
    );
    if (resolvedTitle.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'please_enter_website_title',
        path: ['site_title'],
      });
    } else if (resolvedTitle.length > 70) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'website_title_too_long',
        path: ['site_title'],
      });
    }

    const resolvedDescription = resolveBrandNameVariable(
      data.site_description,
      data.brand_name,
    );
    if (resolvedDescription.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'please_enter_website_description',
        path: ['site_description'],
      });
    } else if (resolvedDescription.length > 160) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'website_description_too_long',
        path: ['site_description'],
      });
    }
  });

export type BrandIdentityFormValues = z.infer<typeof brandIdentitySchema>;

export const themeColorsSchema = z.object({
  primary: z.string().optional(),
  primary_text: z.string().optional(),
  secondary: z.string().optional(),
  secondary_text: z.string().optional(),
  accent: z.string().optional(),
  accent_text: z.string().optional(),
  background: z.string().optional(),
  border: z.string().optional(),
  text: z.string().optional(),
  support_text: z.string().optional(),
  card: z.string().optional(),
  switch_background: z.string().optional(),
  input: z.string().optional(),
  input_border: z.string().optional(),
});

export const brandStyleSchema = z
  .object({
    buttonBorderRadius: z.number().optional(),
    inputBorderRadius: z.number().optional(),
    cardBorderRadius: z.number().optional(),
    lightColors: themeColorsSchema.optional(),
    darkColors: themeColorsSchema.optional(),
  })
  .optional();

export const defaultLightColors = {
  primary: '#282828',
  primary_text: '#FCFCFC',
  secondary: '#FFFFFF',
  secondary_text: '#282828',
  accent: '#F0F1F3',
  accent_text: '#282828',
  background: '#FFFFFF',
  border: '#E0E2E7',
  text: '#282828',
  support_text: '#808080',
  card: '#FFFFFF',
  switch_background: '#EDEDED',
  input: '#FFFFFF',
  input_border: '#E0E2E7',
};

export const defaultDarkColors = {
  primary: '#6009FF',
  primary_text: '#FCFCFC',
  secondary: '#1B1B1B',
  secondary_text: '#FCFCFC',
  accent: '#160733',
  accent_text: '#FCFCFC',
  background: '#1B1B1B',
  border: '#4D4D4D',
  text: '#FCFCFC',
  support_text: '#A8A8A8',
  card: '#282828',
  switch_background: '#282828',
  input: '#1B1B1B',
  input_border: '#4D4D4D',
};

// Placeholders for email branding
export const brandEmailSchema = z
  .object({
    senderName: z.string().optional().or(z.literal('')),
    senderEmail: z
      .string()
      .max(100, { message: 'sender_email_too_long' })
      .email({ message: 'invalid_email_format' })
      .optional()
      .or(z.literal('')),
    primaryEmailColor: z.string().optional(),
    emailBackgroundColor: z.string().optional(),
    emailFooterText: z.string().optional().or(z.literal('')),
    invitationImageUrl: z.any().nullable().optional(),
    verificationImageUrl: z.any().nullable().optional(),
    resetPasswordImageUrl: z.any().nullable().optional(),
    showOrgLogoInEmail: z.boolean().optional(),
    socialLinks: z.any().optional(),
  })
  .optional();

// Per-screen heading/support text for authentication pages
export const authScreenContentSchema = z.object({
  headingText: z
    .string()
    .trim()
    .min(1, { message: 'please_enter_heading_text' })
    .max(70, { message: 'heading_text_too_long' }),
  supportText: z
    .string()
    .max(200, { message: 'support_text_too_long' })
    .optional()
    .or(z.literal('')),
});

export type AuthScreenContent = z.infer<typeof authScreenContentSchema>;

export const brandAuthSchema = z
  .object({
    signIn: authScreenContentSchema,
    signUp: authScreenContentSchema,
    forgotPassword: authScreenContentSchema,
    resetPassword: authScreenContentSchema,
    backgroundType: z.enum(['color', 'image']).optional(),
    backgroundUrl: z.any().optional(),
    showOrgLogoOnHeader: z.boolean().optional(),
  })
  .optional();

// Combined schema for all brand customization
export const brandCustomizationSchema = z
  .object({
    brandIdentity: brandIdentitySchema,
    style: brandStyleSchema,
    email: brandEmailSchema,
    auth: brandAuthSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.email) return;

    const brandName = data.brandIdentity.brand_name;

    if (data.email.senderName) {
      const resolvedSenderName = resolveBrandNameVariable(
        data.email.senderName,
        brandName,
      );
      if (resolvedSenderName.length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'sender_name_too_long',
          path: ['email', 'senderName'],
        });
      }
    }

    if (data.email.emailFooterText) {
      const resolvedFooterText = resolveBrandNameVariable(
        data.email.emailFooterText,
        brandName,
      );
      if (resolvedFooterText.length > 150) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'email_footer_text_too_long',
          path: ['email', 'emailFooterText'],
        });
      }
    }
  });

export type BrandCustomizationFormValues = z.infer<
  typeof brandCustomizationSchema
>;

export const DEFAULT_BRAND_CUSTOMIZATION: BrandCustomizationFormValues = {
  brandIdentity: {
    brand_name: 'SpaceDF',
    site_title: 'SpaceDF - No-Code IoT Management Platform',
    site_description:
      'SpaceDF is a ready-to-use IoT platform that lets you connect, manage, and control all your devices from a single dashboard with no-code and minimal setup.',
    logoLight: null,
    faviconLight: null,
    faviconDark: null,
  },
  style: {
    buttonBorderRadius: 12,
    inputBorderRadius: 12,
    cardBorderRadius: 12,
    lightColors: defaultLightColors,
    darkColors: defaultDarkColors,
  },
  email: {
    senderName: 'The @SpaceDF team',
    senderEmail: 'support@spacedf.com',
    primaryEmailColor: '#171A28',
    emailBackgroundColor: '#FFFFFF',
    emailFooterText: '©2025 Digital Fortress. All right reserved.',
    invitationImageUrl: null,
    verificationImageUrl: null,
    resetPasswordImageUrl: null,
    showOrgLogoInEmail: true,
    socialLinks: {
      linkedin: { enabled: true, url: 'https://linkedin.com/company/spacedf' },
      facebook: { enabled: true, url: 'https://facebook.com/spacedf' },
      instagram: { enabled: true, url: 'https://instagram.com/spacedf' },
      tiktok: { enabled: true, url: 'https://tiktok.com/@spacedf' },
    },
  },
  auth: {
    signIn: {
      headingText: 'Sign in to SpaceDF',
      supportText: 'Sign in to manage your IoT devices',
    },
    signUp: {
      headingText: 'Create your account',
      supportText: 'Get started with SpaceDF in a few seconds.',
    },
    forgotPassword: {
      headingText: 'Forgot Your Password?',
      supportText:
        'Enter your email address and we will send you instructions to reset your password.',
    },
    resetPassword: {
      headingText: 'Create New Password',
      supportText: '',
    },
    backgroundType: 'color',
    showOrgLogoOnHeader: true,
  },
};
