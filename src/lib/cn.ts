/**
 * Merge class names; falsy values are omitted.
 */
export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(' ')
}
