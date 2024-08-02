'use strict';
const map = require('map-iterable');
const tokens = require('../../../utils/tokens');

const reduceToOperatorTokenVisitor = operators => ({
    OPERATOR(tk) {
        if (tk.value in operators) {
            return tokens.changeTokenType(
                tk,
                operators[tk.value],
                tk.value
            );
        }
        return tk;
    }
});

module.exports = (options, mode) => map(
    tokens.applyTokenizerVisitor(reduceToOperatorTokenVisitor(mode.enums.operators))
);