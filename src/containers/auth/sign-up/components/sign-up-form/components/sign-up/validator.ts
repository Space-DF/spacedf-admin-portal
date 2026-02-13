import { z } from 'zod';

export const singUpSchema = z
  .object({
    first_name: z
      .string({ message: 'First Name cannot be empty' })
      .max(50, {
        message: 'First Name must not exceed 50 characters',
      })
      .regex(/^[A-Za-z\s]*$/, {
        message: 'Only alphabetic characters and spaces are accepted',
      }),
    last_name: z
      .string({ message: 'Last Name cannot be empty' })
      .max(50, {
        message: 'Last Name must not exceed 50 characters',
      })
      .regex(/^[A-Za-z\s]*$/, {
        message: 'Only alphabetic characters and spaces are accepted',
      }),
    email: z
      .string({ message: 'Email cannot be empty' })
      .email({ message: 'Invalid Email' })
      .min(1, { message: 'Email cannot be empty' })
      .refine((value) => value.split('@')[0].length <= 64, {
        message: 'Invalid Email', // Local part max length
      })
      .refine((value) => value.split('@')[1]?.length <= 255, {
        message: 'Invalid Email', // Domain part max length
      }),
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
    confirm_password: z
      .string({ message: 'Confirm password cannot be empty' })
      .min(8, { message: 'Must be at least 8 characters long.' }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Confirm password must match the password entered above.',
    path: ['confirm_password'],
  });
