import { z } from 'zod';

export const privacySchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .min(1, { message: 'Email is required' })
      .max(50, {
        message: 'Email must be less than or equal to 50 characters',
      })
      .optional(),
    current_password: z
      .string({ message: 'This field cannot be empty.' })
      .min(8, { message: 'Must be at least 8 characters long.' })
      .max(150, {
        message: 'Password must be less than or equal to 150 characters',
      })
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]).{8,}$/,
        {
          message:
            'Should include at least one uppercase letter, one lowercase letter, one number, and one special character.',
        },
      ),
    new_password: z
      .string({ message: 'New Password cannot be empty ' })
      .min(8, { message: 'Must be at least 8 characters long.' })
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]).{8,}$/,
        {
          message:
            'The password must has least 8 character, including uppercase letters, numbers, and special characters.',
        },
      ),
    confirm_password: z
      .string({ message: 'Confirm password cannot be empty' })
      .min(8, { message: 'Must be at least 8 characters long.' }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Confirm new password must match the new password entered above',
    path: ['confirm_password'],
  });

export type PrivacySchema = z.infer<typeof privacySchema>;
