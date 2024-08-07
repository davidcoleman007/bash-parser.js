import type { LexerPhase, TokenIf } from '~/types.ts';
import map from '~/utils/iterable/map.ts';
import tokens from '~/utils/tokens.ts';

const pathExpansion: LexerPhase = (options) =>
  map((token: TokenIf) => {
    if (token.is('WORD') && typeof options.resolvePath === 'function') {
      return tokens.setValue(token, options.resolvePath(token.value!));
    }

    if (token.is('ASSIGNMENT_WORD') && typeof options.resolvePath === 'function') {
      const parts = token.value!.split('=');
      return tokens.setValue(token, parts[0] + '=' + options.resolvePath(parts[1]));
    }

    return token;
  });

export default pathExpansion;
