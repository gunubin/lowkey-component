export function sleep(msec: number) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(msec, 0)))
}
