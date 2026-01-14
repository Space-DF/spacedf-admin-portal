import { z } from 'zod';

export const profileSchema = z.object({
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
  location: z.string().optional(),
  avatar: z.any().optional(),
  company_name: z
    .string()
    .max(100, {
      message: 'Company name must not exceed 100 characters',
    })
    .optional(),
  title: z
    .string()
    .max(100, {
      message: 'Title must not exceed 100 characters',
    })
    .optional(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
