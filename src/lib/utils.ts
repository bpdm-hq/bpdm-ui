import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names safely:
 *  - clsx     → joins conditional classes  cn("p-2", isActive && "bg-accent")
 *  - twMerge  → resolves Tailwind conflicts cn("p-2", "p-4") -> "p-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
