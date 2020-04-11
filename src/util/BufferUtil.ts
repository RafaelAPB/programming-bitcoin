/**
 * Strips the left bytes if they match the provided value
 * @param val byte value
 */
export function lstrip(buf: Buffer, match: number) {
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] !== match) return Buffer.from(buf.slice(i));
  }
  return Buffer.alloc(0);
}

/**
 * Combines buffers together in the provided order
 * @param buf
 */
export function combine(...buf: Buffer[]): Buffer {
  return Buffer.concat(buf);
}
