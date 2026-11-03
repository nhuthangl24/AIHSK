import { z } from "zod";
import { UserRole } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  targetLevel: z.string().optional().default("HSK 3"),
  nativeLanguage: z.string().optional().default("English"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  targetLevel: z.string().optional(),
  nativeLanguage: z.string().optional(),
  learningGoal: z.string().optional(),
  studyHoursWeekly: z.number().min(1).max(40).optional(),
  bio: z.string().max(500).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
