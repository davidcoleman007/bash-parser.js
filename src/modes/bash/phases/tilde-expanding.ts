import type { LexerPhase } from '~/lexer/types.ts';
import type { TokenIf } from '~/tokenizer/mod.ts';
import type { Options } from '~/types.ts';
import map from '~/utils/iterable/map.ts';

const replace = (text: string, resolveHomeUser: Options['resolveHomeUser']) => {
  let replaced = false;
  let result = text.replace(/^~([^\/]*)\//, (_match, p1) => {
    replaced = true;
    return resolveHomeUser!(p1 || null) + '/';
  });
  // console.log({result, replaced})
  if (!replaced) {
    result = text.replace(/^~(.*)$/, (_match, p1) => {
      return resolveHomeUser!(p1 || null);
    });
  }

  return result;
};

const tildeExpanding: LexerPhase = (ctx) =>
  map((token: TokenIf) => {
    if (token.is('WORD') && typeof ctx.resolvers.resolveHomeUser === 'function') {
      return token.setValue(replace(token.value!, ctx.resolvers.resolveHomeUser));
    }

    if (token.is('ASSIGNMENT_WORD') && typeof ctx.resolvers.resolveHomeUser === 'function') {
      const parts = token.value!.split('=', 2);
      const target = parts[0];
      const sourceParts = parts[1];

      const source = sourceParts
        .split(':')
        .map((text: string) => replace(text, ctx.resolvers.resolveHomeUser!))
        .join(':');

      return token.setValue(target + '=' + source);
    }

    return token;
  });

export default tildeExpanding;
