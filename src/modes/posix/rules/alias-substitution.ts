import map from 'map-iterable';
import merge from 'transform-spread-iterable';
import type { LexerPhase, Options, TokenIf } from '~/types.ts';
import compose from '~/utils/compose.ts';
import tokens from '~/utils/tokens.ts';

const expandAlias = (preAliasLexer, resolveAlias: Options['resolveAlias']) => {
  function* tryExpandToken(token: TokenIf, expandingAliases: string[]): Iterable<TokenIf> {
    if (expandingAliases.indexOf(token.value!) !== -1 || !token._.maybeSimpleCommandName) {
      yield token;
      return;
    }

    const result = resolveAlias!(token.value!);
    if (result === undefined) {
      yield token;
    } else {
      for (const newToken of preAliasLexer(result)) {
        if (newToken.is('WORD')) {
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

  return {
    WORD: (tk: TokenIf) => {
      return Array.from(tryExpandToken(tk, []));
    },
  };
};

const aliasSubstitution: LexerPhase = (options, _, previousPhases) => {
  if (typeof options.resolveAlias !== 'function') {
    return (x) => x;
  }

  const preAliasLexer = compose.apply(null, previousPhases.reverse());
  const visitor = expandAlias(preAliasLexer, options.resolveAlias);

  return compose(
    merge,
    map(
      tokens.applyTokenizerVisitor(visitor),
    ),
  );
};

export default aliasSubstitution;
