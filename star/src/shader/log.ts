const LOG_TAG = '[shader-store-wgsl]'

export function debug(...msgs: unknown[]): void {
  if (import.meta.env.MODE === 'development') {
    console.debug(LOG_TAG, ...msgs)
  }
}

export function warn(...msgs: unknown[]): void {
  if (import.meta.env.MODE === 'development') {
    console.warn(LOG_TAG, ...msgs)
  }
}
