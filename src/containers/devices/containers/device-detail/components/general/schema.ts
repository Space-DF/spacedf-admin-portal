import { z } from 'zod';

export const generalInformationFormSchema = z.object({
  deviceId: z.string(),
  createdAt: z.string(),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .or(z.literal('')),
});

export type GeneralInformationFormValues = z.infer<
  typeof generalInformationFormSchema
>;

export const activationInformationFormSchema = z.object({
  devEui: z
    .string()
    .min(1, 'Dev EUI is required')
    .refine(
      (str) => {
        const numbers = str.split(' ');
        const twoDigitCount = numbers.filter((num) => num.length === 2).length;
        return twoDigitCount === 8;
      },
      {
        message: 'Dev EUI must be 8 bytes',
      },
    ),
  joinEui: z
    .string()
    .min(1, 'Join EUI is required')
    .refine(
      (str) => {
        const numbers = str.split(' ');
        const twoDigitCount = numbers.filter((num) => num.length === 2).length;
        return twoDigitCount === 8;
      },
      {
        message: 'Join EUI must be 8 bytes',
      },
    ),
  appKey: z
    .string()
    .min(1, {
      message: 'App Key is required',
    })
    .regex(/^[0-9A-Fa-f]{32}$/, {
      message: 'Value must be 32 hex characters',
    }),
});

export type ActivationInformationFormValues = z.infer<
  typeof activationInformationFormSchema
>;
