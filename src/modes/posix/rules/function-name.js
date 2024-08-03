'use strict';
const compose = require('../../../utils/compose');

module.exports = function functionName() {
    return function(iterable) {
        const tokens = Array.from(iterable);
        const transformedTokens = [];

        for (let i = 0; i < tokens.length; i++) {
            let tk = tokens[i];
            if (
                tk._.maybeStartOfSimpleCommand &&
                tk.is('WORD') &&
                tokens[i + 2] &&
                tokens[i + 1].is('OPEN_PAREN') &&
                tokens[i + 2].is('CLOSE_PAREN')
            ) {
                tk = tk.changeTokenType('NAME', tk.value);
            }
            transformedTokens.push(tk);
        }

        return transformedTokens;
    };
};