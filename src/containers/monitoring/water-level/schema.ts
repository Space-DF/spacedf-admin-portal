import { z } from 'zod';

import { CELL_SIZE_RESOLUTIONS, H3_RESOLUTION } from '@/containers/map/utils';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
  message: 'invalid_color_format',
});

const meters = z
  .number({
    required_error: 'please_enter_threshold',
    invalid_type_error: 'please_enter_threshold',
  })
  .min(0, { message: 'threshold_cannot_be_negative' });

export const waterLevelSchema = z.object({
  cellResolution: z
    .number()
    .refine((value) =>
      (CELL_SIZE_RESOLUTIONS as readonly number[]).includes(value),
    ),
  // Consecutive upper bounds of one scale, so they must strictly ascend —
  // otherwise the legend renders backwards ranges like "5 - <1 m (Caution)".
  thresholds: z
    .object({
      safe: meters,
      caution: meters,
      warning: meters,
    })
    .superRefine((thresholds, ctx) => {
      if (thresholds.caution <= thresholds.safe) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['caution'],
          message: 'caution_must_exceed_safe',
        });
      }
      if (thresholds.warning <= thresholds.caution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['warning'],
          message: 'warning_must_exceed_caution',
        });
      }
    }),
  zoneColors: z.object({
    safe: hexColor,
    caution: hexColor,
    warning: hexColor,
    danger: hexColor,
  }),
  display: z.object({
    waterColumn: z.boolean(),
    coverage: z.boolean(),
  }),
});

export type WaterLevelFormValues = z.infer<typeof waterLevelSchema>;

export const DEFAULT_WATER_LEVEL: WaterLevelFormValues = {
  cellResolution: H3_RESOLUTION,
  thresholds: {
    safe: 0.5,
    caution: 1,
    warning: 1.5,
  },
  zoneColors: {
    safe: '#08B94E',
    caution: '#EBA622',
    warning: '#FD6665',
    danger: '#E5372B',
  },
  display: {
    waterColumn: true,
    coverage: true,
  },
};
