import type { Expansion, LexerPhase, TokenIf } from '~/types.ts';
import map from '~/utils/iterable/map.ts';
import tokens from '~/utils/tokens.ts';
import unescape from '~/utils/unescape.ts';
import parse from '~/utils/unquote-word.ts';

function unquote(text: string) {
  const result = parse(text);

  if (result.values.length === 0) {
    return text;
  }

  if (result.comment) {
    return '';
  }

  return unescape(result.values[0]);
}

function unresolvedExpansions(token: TokenIf) {
  if (!token.expansion) {
    return false;
  }
  const unresolved = token.expansion.filter((xp: Expansion) => !xp.resolved);
  return unresolved.length > 0;
}

const quoteRemoval: LexerPhase = () =>
  map((token: TokenIf) => {
    if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
      if (!unresolvedExpansions(token)) {
        return tokens.setValue(token, unquote(token.value!));
      }
    }
    return token;
  });

export default quoteRemoval;
