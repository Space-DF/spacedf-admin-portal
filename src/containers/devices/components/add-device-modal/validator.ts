import { z } from 'zod';

const normalizeDevEui = (value: string) =>
  value.replace(/\s+/g, '').toLowerCase();

const addDuplicateEuiErrors = (
  items: Array<{ dev_eui?: string; claim_code?: string | undefined }>,
  ctx: z.RefinementCtx,
) => {
  const devEuiByKey = new Map<string, number[]>();
  const claimCodeByKey = new Map<string, number[]>();

  items.forEach((item, index) => {
    if (item.dev_eui?.trim()) {
      const key = normalizeDevEui(item.dev_eui);
      const indices = devEuiByKey.get(key) ?? [];
      indices.push(index);
      devEuiByKey.set(key, indices);
    }

    const claimCode = item.claim_code?.trim();
    if (claimCode) {
      const key = claimCode.toLowerCase();
      const indices = claimCodeByKey.get(key) ?? [];
      indices.push(index);
      claimCodeByKey.set(key, indices);
    }
  });

  devEuiByKey.forEach((indices) => {
    if (indices.length > 1) {
      indices.forEach((index) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate Dev EUI',
          path: [index, 'dev_eui'],
        });
      });
    }
  });

  claimCodeByKey.forEach((indices) => {
    if (indices.length > 1) {
      indices.forEach((index) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate claim code',
          path: [index, 'claim_code'],
        });
      });
    }
  });
};

export const EUISchema = z.object({
  eui: z
    .array(
      z.object({
        device_model: z
          .string({ required_error: 'Device model is required' })
          .min(1, 'Device model is required'),
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
    )
    .superRefine(addDuplicateEuiErrors),
});

export type EUIDevice = z.infer<typeof EUISchema>;
const optionalRequiredString = (message: string) =>
  z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (value === undefined) return;
      if (!value.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      }
    });

const optionalEui = (label: string) =>
  z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (value === undefined) return;
      if (!value.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is required`,
        });
        return;
      }
      const byteCount = value
        .split(' ')
        .filter((num) => num.length === 2).length;
      if (byteCount !== 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} must be 8 bytes`,
        });
      }
    });

export const euiDeviceTableSchema = z.object({
  eui: z
    .array(
      z.object({
        id: z.string(),
        device_model: z
          .string({ required_error: 'Device model is required' })
          .min(1, { message: 'Device model is required' }),
        serial_number: z.string().optional(),
        dev_eui: optionalEui('Dev EUI'),
        join_eui: optionalEui('Join EUI'),
        claim_code: z.string().optional(),
        app_key: z
          .string()
          .optional()
          .superRefine((value, ctx) => {
            if (value === undefined) return;
            if (!value.trim()) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'App Key is required',
              });
              return;
            }
            if (!/^[0-9A-Fa-f]{32}$/.test(value)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Value must be 32 hex characters',
              });
            }
          }),
        is_published: z.boolean().optional(),
        status: z.string().optional(),
        network_server: optionalRequiredString('Network Server is required'),
      }),
    )
    .superRefine(addDuplicateEuiErrors),
});

export type EuiDeviceTable = z.infer<typeof euiDeviceTableSchema>;

const addDuplicateApiDeviceErrors = (
  items: Array<{
    serial_number?: string | undefined;
    claim_code?: string | undefined;
  }>,
  ctx: z.RefinementCtx,
) => {
  const serialNumberByKey = new Map<string, number[]>();
  const claimCodeByKey = new Map<string, number[]>();

  items.forEach((item, index) => {
    const serialNumber = item.serial_number?.trim();
    if (serialNumber) {
      const key = serialNumber.toLowerCase();
      const indices = serialNumberByKey.get(key) ?? [];
      indices.push(index);
      serialNumberByKey.set(key, indices);
    }

    const claimCode = item.claim_code?.trim();
    if (claimCode) {
      const key = claimCode.toLowerCase();
      const indices = claimCodeByKey.get(key) ?? [];
      indices.push(index);
      claimCodeByKey.set(key, indices);
    }
  });

  serialNumberByKey.forEach((indices) => {
    if (indices.length > 1) {
      indices.forEach((index) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate serial number',
          path: [index, 'serial_number'],
        });
      });
    }
  });

  claimCodeByKey.forEach((indices) => {
    if (indices.length > 1) {
      indices.forEach((index) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate claim code',
          path: [index, 'claim_code'],
        });
      });
    }
  });
};

export const ApiDeviceSchema = z.object({
  api_devices: z
    .array(
      z.object({
        device_model: z
          .string({ required_error: 'Device model is required' })
          .min(1, 'Device model is required'),
        serial_number: z.string().optional(),
        claim_code: z.string().optional(),
        is_published: z.boolean().optional(),
      }),
    )
    .superRefine(addDuplicateApiDeviceErrors),
});

export type ApiDevice = z.infer<typeof ApiDeviceSchema>;
