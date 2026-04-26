/**
 * Утилиты для работы с белорусским номером телефона.
 * Формат: +375 (XX) XXX-XX-XX, где XX — оператор (25, 29, 33, 44 и т.п.)
 */

export const BY_PHONE_PLACEHOLDER = '+375 (29) 123-45-67';

/** Возвращает только цифры из строки */
const digitsOnly = (s: string) => s.replace(/\D/g, '');

/**
 * Форматирует ввод как белорусский номер.
 * Принимает любой ввод и приводит к виду «+375 (XX) XXX-XX-XX».
 */
export function formatBelarusPhone(input: string): string {
  let d = digitsOnly(input);
  // если пользователь стер «+», восстановим страну
  if (d.startsWith('80')) d = '375' + d.slice(2);     // 80XX → 375XX
  if (!d.startsWith('375')) d = '375' + d;
  d = d.slice(0, 12);                                  // 375 + 9 цифр

  const country = d.slice(0, 3);                       // 375
  const op      = d.slice(3, 5);                       // XX
  const p1      = d.slice(5, 8);                       // XXX
  const p2      = d.slice(8, 10);                      // XX
  const p3      = d.slice(10, 12);                     // XX

  let out = `+${country}`;
  if (op)  out += ` (${op}`;
  if (op.length === 2) out += ')';
  if (p1)  out += ` ${p1}`;
  if (p2)  out += `-${p2}`;
  if (p3)  out += `-${p3}`;
  return out;
}

/** Проверяет, что номер заполнен полностью (+375 + 9 цифр) */
export function isValidBelarusPhone(value: string): boolean {
  return digitsOnly(value).length === 12 && digitsOnly(value).startsWith('375');
}
