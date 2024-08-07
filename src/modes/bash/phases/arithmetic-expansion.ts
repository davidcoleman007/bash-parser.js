import { parse } from '@babel/parser';
import { LexerPhase } from '~/lexer/types.ts';
import { Expansion, setExpansions, TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';

function parseArithmeticAST(xp: Expansion) {
  let AST;
  try {
    AST = parse(xp.expression);
  } catch (err) {
    throw new SyntaxError(`Cannot parse arithmetic expression "${xp.expression}": ${err.message}`);
  }

  const expression = AST.program.body[0].expression;

  if (expression === undefined) {
    throw new SyntaxError(`Cannot parse arithmetic expression "${xp.expression}": Not an expression`);
  }

  return JSON.parse(JSON.stringify(expression));
}

const arithmeticExpansion: LexerPhase = () =>
  map((token: TokenIf) => {
    if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
      if (!token.expansion || token.expansion.length === 0) {
        return token;
      }

      return setExpansions(
        token,
        token.expansion.map((xp: Expansion) => {
          if (xp.type === 'arithmetic_expansion') {
            return Object.assign({}, xp, { arithmeticAST: parseArithmeticAST(xp) });
          }
          return xp;
        }),
      );
    }
    return token;
  });

export default arithmeticExpansion;
