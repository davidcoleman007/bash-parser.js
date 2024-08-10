import type { TokenIf, Visitor } from './types.ts';

export const applyVisitor = (visitor: Visitor) => async (tk: TokenIf, _idx: number, iterable: AsyncIterable<TokenIf>) => {
  if (tk.type in visitor) {
    const visit = visitor[tk.type];
    return await visit(tk, iterable);
  }

  if ('defaultMethod' in visitor) {
    const visit = visitor.defaultMethod;
    return await visit(tk, iterable);
  }

  return tk;
};
