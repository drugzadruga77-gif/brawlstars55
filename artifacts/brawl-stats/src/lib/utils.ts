import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const searchSchema = z.object({
  tag: z
    .string()
    .trim()
    .min(3, "Тег слишком короткий")
    .regex(/^[A-Z0-9#]+$/i, "Только буквы и цифры"),
});

export type SearchValues = z.infer<typeof searchSchema>;

export const formatTag = (tag: string) => {
  return tag.replace(/^#/, "").toUpperCase();
};
