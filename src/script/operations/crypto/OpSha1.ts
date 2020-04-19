import crypto from "crypto";

/**
 * Pops an item off the stack and pushes the results onto the stack.
 * The input is hashed using SHA-1.
 * @param stack
 */
export function opSha1(stack: Buffer[]): boolean {
  if (!stack.length) {
    return false;
  }

  const input = stack.pop();
  const output = crypto.createHash("sha1").update(input).digest();
  stack.push(output);

  return true;
}
