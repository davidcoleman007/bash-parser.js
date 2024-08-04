import map from 'map-iterable';
import parse from 'shell-quote-word';
import unescape from 'unescape-js';
import type { Expansion, LexerPhase, TokenIf } from '~/types.ts';
import tokens from '~/utils/tokens.ts';

function unquote(text: string) {
  const unquoted = parse(text);

  if (unquoted.length === 0) {
    return text;
  }

  if (unquoted[0].comment) {
    return '';
  }
  return unescape(unquoted[0]);
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
