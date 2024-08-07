import type { LexerPhase, TokenIf } from '~/types.ts';
import map from '~/utils/iterable/map.ts';
import { ReplaceString } from '~/utils/replace-string.ts';
import fieldSplittingMark from './lib/field-splitting-mark.ts';

const parameterExpansionResolve: LexerPhase = (options) =>
  map((token: TokenIf) => {
    if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
      if (!options.resolveParameter || !token.expansion || token.expansion.length === 0) {
        return token;
      }

      const rValue = new ReplaceString(token.value!);

      for (const xp of token.expansion) {
        if (xp.type === 'parameter_expansion') {
          const result = options.resolveParameter(xp);
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

export default parameterExpansionResolve;
