export function assert(expr: unknown, msg = "Assertion failed") {
  if (!expr) {
    throw new AssertionError(msg);
  }
}

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
 }