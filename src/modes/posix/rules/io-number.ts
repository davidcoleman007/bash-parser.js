import type { LexerPhase, TokenIf } from '~/types.ts';
import compose from '~/utils/compose.ts';
import lookahead, { type LookaheadIterable } from '~/utils/iterable/lookahead.ts';
import map from '~/utils/iterable/map.ts';

const ioNumber: LexerPhase = (_options, mode) => {
  return compose<TokenIf>(
    map((tk: TokenIf, _idx, iterable) => {
      const it = iterable as LookaheadIterable<TokenIf>;
      const next = it.ahead(1);

      if (tk && tk.is('WORD') && tk.value!.match(/^[0-9]+$/) && mode.enums.IOFileOperators.isOperator(next)) {
        return tk.changeTokenType('IO_NUMBER', tk.value!);
      }

      return tk;
    }),
    lookahead,
  );
};

export default ioNumber;
