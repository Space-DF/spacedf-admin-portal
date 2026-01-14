import { z } from 'zod';

export const deleteAccountSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .min(1, { message: 'Email is required' })
    .max(50, {
      message: 'Email must be less than or equal to 50 characters',
    }),
});

export type DeleteAccountSchema = z.infer<typeof deleteAccountSchema>;
