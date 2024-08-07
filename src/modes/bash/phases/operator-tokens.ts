import { LexerPhase } from '~/lexer/types.ts';
import { applyTokenizerVisitor, changeTokenType, TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';

const reduceToOperatorTokenVisitor = (operators: Record<string, string>) => ({
  OPERATOR(tk: TokenIf) {
    if (tk.value! in operators) {
      return changeTokenType(
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
    applyTokenizerVisitor(reduceToOperatorTokenVisitor(mode.enums.operators)),
  );

export default operatorTokens;
