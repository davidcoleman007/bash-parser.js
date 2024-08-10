import type { LexerPhase } from '~/lexer/types.ts';
import type { TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';

const pathExpansion: LexerPhase = (ctx) =>
  map(async (token: TokenIf) => {
    if (token.is('WORD') && typeof ctx.resolvers.resolvePath === 'function') {
      return token.setValue(ctx.resolvers.resolvePath(token.value!));
    }

    if (token.is('ASSIGNMENT_WORD') && typeof ctx.resolvers.resolvePath === 'function') {
      const parts = token.value!.split('=');
      return token.setValue(parts[0] + '=' + ctx.resolvers.resolvePath(parts[1]));
    }

    return token;
  });

export default pathExpansion;
