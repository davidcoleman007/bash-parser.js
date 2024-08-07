import { LexerPhase } from '~/lexer/types.ts';
import { TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';
import { ReplaceString } from '~/utils/replace-string.ts';
import fieldSplittingMark from './lib/field-splitting-mark.ts';

const arithmeticExpansionResolve: LexerPhase = (options) =>
  map((token: TokenIf) => {
    if (options.runArithmeticExpression && token.expansion) {
      const rValue = new ReplaceString(token.value!);

      for (const xp of token.expansion) {
        if (xp.type === 'arithmetic_expansion') {
          const result = options.runArithmeticExpression(xp);
          const replacement = fieldSplittingMark(result, token.value!, options);

          rValue.replace(
            xp.loc!.start,
            xp.loc!.end + 1,
            replacement,
          );
          xp.resolved = true;
        }
      }

      return token.alterValue(rValue.text);
    }
    return token;
  });

export default arithmeticExpansionResolve;
