import { z } from 'zod';

export const singInSchema = z.object({
  email: z
    .string({ message: 'Email cannot be empty' })
    .email({ message: 'Please enter a valid email address' })
    .min(1, { message: 'Email is required' })
    .max(50, { message: 'Email must be less than or equal to 50 characters' }),

  password: z
    .string({ message: 'Password cannot be empty' })
    .min(8, { message: 'Must be at least 8 characters long.' })
    .max(150, {
      message: 'Password must be less than or equal to 150 characters',
    })
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\\[\]:;<>,.?~\\/-]).{8,}$/,
      {
        message:
          'The password must has least 8 character, including uppercase letters, numbers, and special characters.',
      },
    ),
  remember_me: z.boolean().optional(),
});
