import { z } from 'zod';
import { isValidBelarusPhone } from './phone';

export const requiredString = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} обязательно`).max(max, `${label}: не более ${max} символов`);

export const optionalEmail = z
  .string()
  .trim()
  .max(255)
  .email('Неверный формат email')
  .or(z.literal(''))
  .optional();

export const optionalBYPhone = z
  .string()
  .trim()
  .refine(v => !v || isValidBelarusPhone(v), 'Телефон должен быть в формате +375 (XX) XXX-XX-XX')
  .optional();

export const loginSchema = z
  .string()
  .trim()
  .min(3, 'Логин: минимум 3 символа')
  .max(40, 'Логин: не более 40 символов')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Только латинские буквы, цифры, . _ -');

export const passwordSchema = z
  .string()
  .min(4, 'Пароль: минимум 4 символа')
  .max(64, 'Пароль: не более 64 символов');

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'ФИО: минимум 2 символа')
  .max(120, 'ФИО: не более 120 символов');

export type ValidationError = { field: string; message: string };

/** Проверяет данные через схему и возвращает массив ошибок (или пустой). */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationError[] {
  const r = schema.safeParse(data);
  if (r.success) return [];
  return r.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }));
}
