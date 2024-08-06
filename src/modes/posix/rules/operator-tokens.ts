import type { LexerPhase, TokenIf } from '~/types.ts';
import map from '~/utils/iterable/map.ts';
import tokens from '~/utils/tokens.ts';

const reduceToOperatorTokenVisitor = (operators: Record<string, string>) => ({
  OPERATOR(tk: TokenIf) {
    if (tk.value! in operators) {
      return tokens.changeTokenType(
        tk,
        operators[tk.value!],
        tk.value!,
      );
    }
    return tk;
  },
});

const operatorTokens: LexerPhase = (_options, mode) =>
  map(
    tokens.applyTokenizerVisitor(reduceToOperatorTokenVisitor(mode.enums.operators)),
  );

export default operatorTokens;
