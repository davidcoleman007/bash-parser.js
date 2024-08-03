'use strict';

const compose = require('../../../utils/compose');

module.exports = function identifyMaybeSimpleCommands(options, mode) {
    return function(iterable) {
        const tokens = Array.from(iterable);
        const transformedTokens = [];

        for (let i = 0; i < tokens.length; i++) {
            const tk = tokens[i];
            const last = tokens[i - 1] || { EMPTY: true, is: type => type === 'EMPTY' };

            // evaluate based on last token
            tk._.maybeStartOfSimpleCommand = Boolean(
                last.is('EMPTY') || last.is('SEPARATOR_OP') || last.is('OPEN_PAREN') ||
                last.is('CLOSE_PAREN') || last.is('NEWLINE') || last.is('NEWLINE_LIST') ||
                last.is('TOKEN') === ';' || last.is('PIPE') ||
                last.is('DSEMI') || last.is('OR_IF') || last.is('PIPE') || last.is('AND_IF') ||
                (!last.is('For') && !last.is('In') && !last.is('Case') && Object.values(mode.enums.reservedWords).some(word => last.is(word)))
            );

            transformedTokens.push(tk);
        }

        return transformedTokens;
    };
};