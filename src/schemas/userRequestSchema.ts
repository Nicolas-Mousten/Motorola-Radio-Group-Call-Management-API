import { z } from 'zod';

export const userRequestSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  priority: z.number().min(1).max(5).optional(),
});

export type UserRequest = z.infer<typeof userRequestSchema>;
