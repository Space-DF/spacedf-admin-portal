export type AuthScreenId =
  | 'sign-in'
  | 'sign-up'
  | 'forgot-password'
  | 'reset-password';

export type AuthScreenFormKey =
  | 'signIn'
  | 'signUp'
  | 'forgotPassword'
  | 'resetPassword';

interface AuthScreenMeta {
  id: AuthScreenId;
  formKey: AuthScreenFormKey;
  labelKey: string;
}

export const AUTH_SCREENS: AuthScreenMeta[] = [
  { id: 'sign-in', formKey: 'signIn', labelKey: 'sign_in_screen' },
  { id: 'sign-up', formKey: 'signUp', labelKey: 'sign_up_screen' },
  {
    id: 'forgot-password',
    formKey: 'forgotPassword',
    labelKey: 'forgot_password_screen',
  },
  {
    id: 'reset-password',
    formKey: 'resetPassword',
    labelKey: 'reset_password_screen',
  },
];
