/**
 * Fisher–Yates shuffle on a shallow copy. Uses crypto.getRandomValues when available.
 * Intended for UI ordering (not security-sensitive).
 */
function randomIntBelow(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0
  try {
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    return arr[0] % maxExclusive
  } catch {
    return Math.floor(Math.random() * maxExclusive)
  }
}

export function shuffleCopy<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomIntBelow(i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
