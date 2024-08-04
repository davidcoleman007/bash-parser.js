import lookahead from 'iterable-lookahead';
import map from 'map-iterable';
import type { LexerPhase, TokenIf } from '~/types.ts';
import compose from '~/utils/compose.ts';
import isValidName from '~/utils/is-valid-name.ts';

// import isOperator from '../enums/io-file-operators.mjs';

function couldEndSimpleCommand(scTk: TokenIf) {
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
}

function couldBeCommandName(tk: TokenIf) {
  return tk && tk.is('WORD') && isValidName(tk.value!);
}

const identifySimpleCommandNames: LexerPhase = (_options, mode) =>
  compose(
    map((tk: TokenIf, idx, iterable) => {
      if (tk._.maybeStartOfSimpleCommand) {
        if (couldBeCommandName(tk)) {
          tk._.maybeSimpleCommandName = true;
        } else {
          const next = iterable.ahead(1);
          if (next && !couldEndSimpleCommand(next)) {
            next._.commandNameNotFoundYet = true;
          }
        }
      }

      if (tk._.commandNameNotFoundYet) {
        const last = iterable.behind(1);

        if (!mode.enums.IOFileOperators.isOperator(last) && couldBeCommandName(tk)) {
          tk._.maybeSimpleCommandName = true;
        } else {
          const next = iterable.ahead(1);
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
