import map from 'map-iterable';
import { LexerPhase } from '~/types.ts';
import tokens from '~/utils/tokens.ts';

const reduceToOperatorTokenVisitor = (operators) => ({
  OPERATOR(tk) {
    if (tk.value in operators) {
      return tokens.changeTokenType(
        tk,
        operators[tk.value],
        tk.value,
      );
    }
    return tk;
  },
});

const operatorTokens: LexerPhase = (options, mode) =>
  map(
    tokens.applyTokenizerVisitor(reduceToOperatorTokenVisitor(mode.enums.operators)),
  );

export default operatorTokens;
