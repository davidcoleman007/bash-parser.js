import type { LexerPhase } from '~/lexer/types.ts';
import type { Expansion, TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';
import unescape from '~/utils/unescape.ts';
import unquoteWord from '~/utils/unquote-word.ts';

const unquote = (text: string) => {
  const result = unquoteWord(text);

  if (result.values.length === 0) {
    return text;
  }

  if (result.comment) {
    return '';
  }

  return unescape(result.values[0]);
};

const unresolvedExpansions = (token: TokenIf) => {
  if (!token.expansion) {
    return false;
  }

  return token.expansion.some((xp: Expansion) => !xp.resolved);
};

const quoteRemoval: LexerPhase = () =>
  map(async (token: TokenIf) => {
    if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
      if (!unresolvedExpansions(token)) {
        return token.setValue(unquote(token.value!));
      }
    }

    return token;
  });

export default quoteRemoval;
