import { LexerPhase } from '~/lexer/types.ts';
import { mkFieldSplitToken, TokenIf } from '~/tokenizer/mod.ts';
import compose from '~/utils/compose.ts';
import flatten from '~/utils/iterable/flatten.ts';
import map from '~/utils/iterable/map.ts';

export const fieldSplitting: LexerPhase = () =>
  compose<TokenIf>(
    flatten,
    map((token: TokenIf) => {
      if (token.is('WORD')) {
        const fields = token.value!.split('\0');

        if (fields.length > 1) {
          let idx = 0;

          return fields.map((field) => mkFieldSplitToken(token, field, idx++)) as TokenIf[];
        }
      }

      return token;
    }),
  );

export default fieldSplitting;
