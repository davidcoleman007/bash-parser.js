
import map from 'map-iterable';
import tokens from '../../../utils/tokens.js';

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

export default (options, mode) => map(
    tokens.applyTokenizerVisitor(reduceToOperatorTokenVisitor(mode.enums.operators))
);