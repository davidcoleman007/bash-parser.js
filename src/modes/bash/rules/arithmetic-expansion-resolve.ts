import type { LexerPhase, TokenIf } from '~/types.ts';
import map from '~/utils/iterable/map.ts';
import overwriteInString from '~/utils/overwrite-in-string.ts';
import fieldSplittingMark from './lib/field-splitting-mark.ts';

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
