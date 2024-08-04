import map from 'map-iterable';
import merge from 'transform-spread-iterable';
import type { LexerPhase, TokenIf } from '~/types.ts';
import compose from '~/utils/compose.ts';
import { mkFieldSplitToken } from '~/utils/tokens.ts';

export const fieldSplitting: LexerPhase = () =>
  compose(
    merge,
    map((token: TokenIf) => {
      if (token.is('WORD')) {
        const fields = token.value!.split('\0');
        if (fields.length > 1) {
          let idx = 0;
          return fields.map((field) => mkFieldSplitToken(token, field, idx++));
        }
      }

      return token;
    }),
  );

export default fieldSplitting;
