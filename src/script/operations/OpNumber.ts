import { encodeNum } from "../NumCodec";

/**
 * Number zero which pushes an empty byte array onto the stack
 * @param stack
 */
export function op0(stack: Buffer[]): boolean {
  stack.push(encodeNum(0n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op1(stack: Buffer[]): boolean {
  stack.push(encodeNum(1n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op2(stack: Buffer[]): boolean {
  stack.push(encodeNum(2n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op3(stack: Buffer[]): boolean {
  stack.push(encodeNum(3n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op4(stack: Buffer[]): boolean {
  stack.push(encodeNum(4n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op5(stack: Buffer[]): boolean {
  stack.push(encodeNum(5n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op6(stack: Buffer[]): boolean {
  stack.push(encodeNum(6n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op7(stack: Buffer[]): boolean {
  stack.push(encodeNum(7n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op8(stack: Buffer[]): boolean {
  stack.push(encodeNum(8n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op9(stack: Buffer[]): boolean {
  stack.push(encodeNum(9n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op10(stack: Buffer[]): boolean {
  stack.push(encodeNum(10n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op11(stack: Buffer[]): boolean {
  stack.push(encodeNum(11n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op12(stack: Buffer[]): boolean {
  stack.push(encodeNum(12n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op13(stack: Buffer[]): boolean {
  stack.push(encodeNum(13n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op14(stack: Buffer[]): boolean {
  stack.push(encodeNum(14n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op15(stack: Buffer[]): boolean {
  stack.push(encodeNum(15n));
  return true;
}

/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op16(stack: Buffer[]): boolean {
  stack.push(encodeNum(16n));
  return true;
}
