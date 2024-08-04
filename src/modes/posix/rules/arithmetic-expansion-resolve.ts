import map from 'map-iterable';
import fieldSplittingMark from '~/modes/posix/rules/lib/field-splitting-mark.ts';
import type { LexerPhase, TokenIf } from '~/types.ts';
import overwriteInString from '~/utils/overwrite-in-string.ts';

const arithmeticExpansionResolve: LexerPhase = (options) =>
  map((token: TokenIf) => {
    if (options.runArithmeticExpression && token.expansion) {
      let value = token.value!;

      for (const xp of token.expansion) {
        if (xp.type === 'arithmetic_expansion') {
          const result = options.runArithmeticExpression(xp);
          value = overwriteInString(
            value,
            xp.loc.start,
            xp.loc.end + 1,
            fieldSplittingMark(result, value, options),
          );
          xp.resolved = true;
        }
      }

      return token.alterValue(value);
    }
    return token;
  });

export default arithmeticExpansionResolve;
