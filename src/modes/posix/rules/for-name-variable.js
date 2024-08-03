'use strict';
const compose = require('../../../utils/compose');
const isValidName = require('../../../utils/is-valid-name');

module.exports = function forNameVariable() {
    return function(iterable) {
        const transformedTokens = [];
        let lastToken = { is: () => false };

        for (const tk of iterable) {
            if (lastToken.is('For') && tk.is('WORD') && isValidName(tk.value)) {
                transformedTokens.push(tk.changeTokenType('NAME', tk.value));
            } else {
                transformedTokens.push(tk);
            }
            lastToken = tk;
        }

        return transformedTokens;
    };
};