import lookahead from 'iterable-lookahead';
import compose from '../../../utils/compose.js';
import map from 'map-iterable';
import isValidName from '../../../utils/is-valid-name.js';

// import isOperator from '../enums/io-file-operators.mjs';

function couldEndSimpleCommand(scTk) {
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

function couldBeCommandName(tk) {
    return tk && tk.is('WORD') && isValidName(tk.value);
}

export default (options, mode) => compose(
    map((tk, idx, iterable) => {
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
    lookahead
);
