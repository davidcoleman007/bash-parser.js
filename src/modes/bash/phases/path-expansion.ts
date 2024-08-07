import { LexerPhase } from '~/lexer/types.ts';
import { setValue, TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';

const pathExpansion: LexerPhase = (options) =>
  map((token: TokenIf) => {
    if (token.is('WORD') && typeof options.resolvePath === 'function') {
      return setValue(token, options.resolvePath(token.value!));
    }

    if (token.is('ASSIGNMENT_WORD') && typeof options.resolvePath === 'function') {
      const parts = token.value!.split('=');
      return setValue(token, parts[0] + '=' + options.resolvePath(parts[1]));
    }

    return token;
  });

export default pathExpansion;
