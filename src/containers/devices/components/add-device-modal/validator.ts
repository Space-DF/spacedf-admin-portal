import { z } from 'zod';

export const EUISchema = z.object({
  eui: z.array(
    z.object({
      dev_eui: z
        .string({ required_error: 'Dev EUI is required' })
        .min(1, 'Dev EUI is required')
        .refine(
          (str) => {
            const numbers = str.split(' ');
            const twoDigitCount = numbers.filter(
              (num) => num.length === 2,
            ).length;
            return twoDigitCount === 8;
          },
          {
            message: 'Dev EUI must be 8 bytes',
          },
        ),
      join_eui: z
        .string({ required_error: 'Join EUI is required' })
        .min(1, 'Join EUI is required')
        .refine(
          (str) => {
            const numbers = str.split(' ');
            const twoDigitCount = numbers.filter(
              (num) => num.length === 2,
            ).length;
            return twoDigitCount === 8;
          },
          {
            message: 'Join EUI must be 8 bytes',
          },
        ),
      claim_code: z
        .string({ required_error: 'Claim Code is required' })
        .optional(),
      app_key: z
        .string({ required_error: 'App Key is required' })
        .min(1, {
          message: 'App Key is required',
        })
        .regex(/^[0-9A-Fa-f]{32}$/, {
          message: 'Value must be 32 hex characters',
        }),
      is_published: z.boolean().optional(),
    }),
  ),
});

export type EUIDevice = z.infer<typeof EUISchema>;

export const euiDeviceTableSchema = z.object({
  eui: z.array(
    z.object({
      id: z.string(),
      dev_eui: z
        .string()
        .min(1, 'Dev EUI is required')
        .refine(
          (str) => {
            const numbers = str.split(' ');
            const twoDigitCount = numbers.filter(
              (num) => num.length === 2,
            ).length;
            return twoDigitCount === 8;
          },
          {
            message: 'Dev EUI must be 8 bytes',
          },
        ),
      join_eui: z
        .string({ required_error: 'Join EUI is required' })
        .min(1, {
          message: 'Join EUI is required',
        })
        .refine(
          (str) => {
            const numbers = str.split(' ');
            const twoDigitCount = numbers.filter(
              (num) => num.length === 2,
            ).length;
            return twoDigitCount === 8;
          },
          {
            message: 'Join EUI must be 8 bytes',
          },
        ),
      claim_code: z.string().optional(),
      app_key: z
        .string({ required_error: 'App Key is required' })
        .min(1, {
          message: 'App Key is required',
        })
        .regex(/^[0-9A-Fa-f]{32}$/, {
          message: 'Value must be 32 hex characters',
        }),
      is_published: z.boolean().optional(),
      status: z.string().optional(),
      network_server: z
        .string({ required_error: 'Network Server is required' })
        .min(1, {
          message: 'Network Server is required',
        }),
    }),
  ),
});

export type EuiDeviceTable = z.infer<typeof euiDeviceTableSchema>;
