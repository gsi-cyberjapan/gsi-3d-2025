import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const stopPropagation = (e: React.SyntheticEvent) => {
  e.stopPropagation();
};

export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: readonly K[]
): Omit<T, K> {
  const clone = { ...obj };
  // eslint-disable-next-line
  for (const k of keys) delete (clone as any)[k];
  return clone as Omit<T, K>;
}
