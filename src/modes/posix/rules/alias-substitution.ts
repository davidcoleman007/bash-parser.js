import type { LexerPhase, Options, TokenIf } from '~/types.ts';
import compose from '~/utils/compose.ts';
import flatten from '~/utils/iterable/flatten.ts';
import map from '~/utils/iterable/map.ts';
import tokens from '~/utils/tokens.ts';

const expandAlias = (preAliasLexer, resolveAlias: Options['resolveAlias'], reservedWords: string[]) => {
  function* tryExpandToken(token: TokenIf, expandingAliases: string[]): Iterable<TokenIf> {
    if (expandingAliases.indexOf(token.value!) !== -1) {
      yield token;
      return;
    }
    const result = resolveAlias!(token.value!);
    if (result === undefined) {
      yield token;
    } else {
      for (const newToken of preAliasLexer(result)) {
        if (newToken.is('WORD') || reservedWords.some((word) => newToken.is(word))) {
          yield* tryExpandToken(
            newToken,
            expandingAliases.concat(token.value!),
          );
        } else if (!newToken.is('EOF')) {
          yield newToken;
        }
      }
    }
  }

  const expandToken = (tk: TokenIf) => {
    return Array.from(tryExpandToken(tk, []));
  };

  const visitor = {
    WORD: expandToken,
  };

  reservedWords.forEach((w) => {
    visitor[w] = expandToken;
  });
  return visitor;
};

const aliasSubstitution: LexerPhase = (options, mode, previousPhases) => {
  if (typeof options.resolveAlias !== 'function') {
    return (x) => x;
  }

  const preAliasLexer = compose.apply(null, previousPhases.reverse());
  const visitor = expandAlias(preAliasLexer, options.resolveAlias, Object.values(mode.enums.reservedWords));

  return compose(
    flatten,
    map(
      tokens.applyTokenizerVisitor(visitor),
    ),
  );
};

export default aliasSubstitution;
