'use strict';
const compose = require('../../../utils/compose');

module.exports = function ioNumber(options, mode) {
    return (tokens) => {
        for (let i = 0; i < tokens.length; i++) {
            const tk = tokens[i];
            const next = tokens[i + 1];

            if (tk && tk.is('WORD') && tk.value.match(/^[0-9]+$/) && mode.enums.IOFileOperators.isOperator(next)) {
                tokens[i] = tk.changeTokenType('IO_NUMBER', tk.value);
            }
        }
        return tokens;
    };
};