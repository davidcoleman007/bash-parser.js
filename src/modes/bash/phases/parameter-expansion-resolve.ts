import type { LexerPhase } from '~/lexer/types.ts';
import type { TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';
import { ReplaceString } from '~/utils/replace-string.ts';
import fieldSplittingMark from './lib/field-splitting-mark.ts';

const parameterExpansionResolve: LexerPhase = (ctx) =>
  map((token: TokenIf) => {
    if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
      if (!ctx.resolvers.resolveParameter || !token.expansion || token.expansion.length === 0) {
        return token;
      }

      const rValue = new ReplaceString(token.value!);

      for (const xp of token.expansion) {
        if (xp.type === 'parameter_expansion') {
          const result = ctx.resolvers.resolveParameter(xp);
          const replacement = fieldSplittingMark(result, token.value!, ctx.resolvers.resolveEnv);

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
