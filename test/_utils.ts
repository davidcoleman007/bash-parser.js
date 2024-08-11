import { assertEquals } from '@std/assert';
import type { AstSourceLocation } from '~/ast/types.ts';

export const mkloc2 = function mkloc(startLine: number, startColumn: number, endLine: number, endColumn: number, startChar: number, endChar: number): AstSourceLocation {
  return {
    start: { row: startLine, col: startColumn, char: startChar },
    end: { row: endLine, col: endColumn, char: endChar },
  };
};

export const checkResults = (actual: any, expected: any) => {
  //console.log(JSON.stringify(actual, null, 4));

  assertEquals(actual, expected);
};

export default {
  mkloc2,
  checkResults,
};
