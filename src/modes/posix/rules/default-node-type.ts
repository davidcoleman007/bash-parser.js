import map from 'map-iterable';
import type { LexerPhase, TokenIf } from '~/types.ts';
import toPascal from '~/utils/to-pascal-case.ts';

const defaultNodeType: LexerPhase = () =>
  map((token: TokenIf) => {
    const tk = Object.assign({}, token);
    if (tk.type) {
      tk.originalType = token.type;
      // console.log({defaultNodeType, tk})
      if (token.is('WORD') || token.is('NAME') || token.is('ASSIGNMENT_WORD')) {
        tk.type = toPascal(tk.type);
      } else {
        tk.type = token.type.toLowerCase();
      }

      for (const xp of tk.expansion || []) {
        xp.type = toPascal(xp.type!);
      }

      delete tk._;
    }
    // Object.freeze(tk);
    return tk;
  });

export default defaultNodeType;
