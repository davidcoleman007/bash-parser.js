export * from './types.ts';
export { grammar };
import * as _grammar from './parser.js';
import type { Grammar } from './types.ts';

const grammar = _grammar as unknown as Grammar;
