import lookahead from 'iterable-lookahead';
import map from 'map-iterable';
import { LexerPhase } from '~/types.ts';
import compose from '~/utils/compose.ts';

const ioNumber: LexerPhase = (options, mode) => {
  return compose(
    map((tk, idx, iterable) => {
      const next = iterable.ahead(1);

      if (tk && tk.is('WORD') && tk.value.match(/^[0-9]+$/) && mode.enums.IOFileOperators.isOperator(next)) {
        return tk.changeTokenType('IO_NUMBER', tk.value);
      }

      return tk;
    }),
    lookahead,
  );
};

export default ioNumber;
