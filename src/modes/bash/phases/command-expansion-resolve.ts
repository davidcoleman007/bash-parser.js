import { LexerPhase } from '~/lexer/types.ts';
import { TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';
import { ReplaceString } from '~/utils/replace-string.ts';
import fieldSplittingMark from './lib/field-splitting-mark.ts';

const commandExpansionResolve: LexerPhase = (options) =>
  map((token: TokenIf) => {
    if (options.execCommand && token.expansion) {
      const rValue = new ReplaceString(token.value!);

      for (const xp of token.expansion) {
        if (xp.type === 'command_expansion') {
          const result = options.execCommand(xp);
          const replacement = fieldSplittingMark(result.replace(/\n+$/, ''), token.value!, options);

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

export default commandExpansionResolve;
