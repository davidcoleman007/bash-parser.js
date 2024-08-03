'use strict';
const compose = require('../../../utils/compose');
const isValidName = require('../../../utils/is-valid-name');

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

module.exports = (options, mode) => {
    return (tokens) => {
        for (let i = 0; i < tokens.length; i++) {
            const tk = tokens[i];

            if (tk._.maybeStartOfSimpleCommand) {
                if (couldBeCommandName(tk)) {
                    tk._.maybeSimpleCommandName = true;
                } else {
                    const next = tokens[i + 1];
                    if (next && !couldEndSimpleCommand(next)) {
                        next._.commandNameNotFoundYet = true;
                    }
                }
            }

            if (tk._.commandNameNotFoundYet) {
                const last = tokens[i - 1];

                if (!mode.enums.IOFileOperators.isOperator(last) && couldBeCommandName(tk)) {
                    tk._.maybeSimpleCommandName = true;
                } else {
                    const next = tokens[i + 1];
                    if (next && !couldEndSimpleCommand(next)) {
                        next._.commandNameNotFoundYet = true;
                    }
                }
                delete tk._.commandNameNotFoundYet;
            }
        }
        return tokens;
    };
};