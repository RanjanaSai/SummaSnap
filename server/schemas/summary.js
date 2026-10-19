import { z } from 'zod';

export const summarySchema = z.object({
  chapters: z.array(z.object({
    title: z.string().min(1),
    main_points: z.array(z.string()),
    formulas: z.array(z.string()),
    theorems: z.array(z.string()),
  }).strict()).min(1),
}).strict();

export const summaryJsonSchema = {
  type: 'object',
  properties: {
    chapters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          main_points: { type: 'array', items: { type: 'string' } },
          formulas: { type: 'array', items: { type: 'string' } },
          theorems: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'main_points', 'formulas', 'theorems'],
        additionalProperties: false,
      },
    },
  },
  required: ['chapters'],
  additionalProperties: false,
};
