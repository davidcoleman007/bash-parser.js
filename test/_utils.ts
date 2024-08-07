import { assertEquals } from '@std/assert';
import type { Location } from '~/types.ts';

export const mkloc = function mkloc(startLine: number, startColumn: number, endLine: number, endColumn: number) {
  return { startLine, startColumn, endLine, endColumn };
};

export const mkloc2 = function mkloc(startLine: number, startColumn: number, endLine: number, endColumn: number, startChar: number, endChar: number): Location {
  return {
    start: { row: startLine, col: startColumn, char: startChar },
    end: { row: endLine, col: endColumn, char: endChar },
  };
};

export const logResults = function logResults(results: any) {
  console.log(JSON.stringify(results, null, 4).replace(/"/g, "'"));
};

export const checkResults = (actual: any, expected: any) => {
  // exports.logResults(actual);

  assertEquals(actual, expected);
};

export default {
  mkloc,
  mkloc2,
  logResults,
  checkResults,
};
