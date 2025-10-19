import { z } from 'zod';

export const groupParamsSchema = z.object({
  groupId: z.string().min(1, "groupId is required"),
});

export const groupUserParamsSchema = z.object({
  groupId: z.string().min(1, "groupId is required"),
  userId: z.string().min(1, "userId is required"),
});