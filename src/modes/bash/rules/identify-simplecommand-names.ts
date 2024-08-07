import type { LexerPhase, TokenIf } from '~/types.ts';
import compose from '~/utils/compose.ts';
import isValidName from '~/utils/is-valid-name.ts';
import lookahead, { type LookaheadIterable } from '~/utils/iterable/lookahead.ts';
import map from '~/utils/iterable/map.ts';

const couldEndSimpleCommand = (scTk: TokenIf) => {
  return scTk && (
    scTk.is('SEPARATOR_OP') ||
    scTk.is('NEWLINE') ||
    scTk.is('NEWLINE_LIST') ||
    scTk.value === ';' ||
    scTk.is('PIPE') ||
    scTk.is('OR_IF') ||
    scTk.is('PIPE') ||
    scTk.is('AND_IF')
  );
};

const couldBeCommandName = (tk: TokenIf) => {
  return tk && tk.is('WORD') && isValidName(tk.value!);
};

const identifySimpleCommandNames: LexerPhase = (_options, mode) =>
  compose<TokenIf>(
    map((tk: TokenIf, _idx, iterable) => {
      const it = iterable as LookaheadIterable<TokenIf>;
      if (tk._.maybeStartOfSimpleCommand) {
        if (couldBeCommandName(tk)) {
          tk._.maybeSimpleCommandName = true;
        } else {
          const next = it.ahead(1);
          if (next && !couldEndSimpleCommand(next)) {
            next._.commandNameNotFoundYet = true;
          }
        }
      }

      if (tk._.commandNameNotFoundYet) {
        const last = it.behind(1);

        if (!mode.enums.IOFileOperators.some((op) => last!.type === op) && couldBeCommandName(tk)) {
          tk._.maybeSimpleCommandName = true;
        } else {
          const next = it.ahead(1);
          if (next && !couldEndSimpleCommand(next)) {
            next._.commandNameNotFoundYet = true;
          }
        }
        delete tk._.commandNameNotFoundYet;
      }

      return tk;
    }),
    lookahead,
  );

export default identifySimpleCommandNames;
