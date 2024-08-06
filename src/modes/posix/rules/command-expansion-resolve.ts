import fieldSplittingMark from '~/modes/posix/rules/lib/field-splitting-mark.ts';
import type { LexerPhase, TokenIf } from '~/types.ts';
import map from '~/utils/iterable/map.ts';
import overwriteInString from '~/utils/overwrite-in-string.ts';

const commandExpansionResolve: LexerPhase = (options) =>
  map((token: TokenIf) => {
    if (options.execCommand && token.expansion) {
      let value = token.value!;

      for (const xp of token.expansion) {
        if (xp.type === 'command_expansion') {
          const result = options.execCommand(xp);
          // console.log({value, xp})
          value = overwriteInString(
            value,
            xp.loc.start,
            xp.loc.end + 1,
            fieldSplittingMark(result.replace(/\n+$/, ''), value, options),
          );
          xp.resolved = true;
        }
      }
      return token.alterValue(value);
    }
    return token;
  });

export default commandExpansionResolve;
