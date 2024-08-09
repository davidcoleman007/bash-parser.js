import type { AstNodeCommand } from '~/ast/types.ts';
import type { LexerPhase } from '~/lexer/types.ts';
import type { Enums, ParameterOp } from '~/modes/types.ts';
import bashParser from '~/parse.ts';
import type { Expansion, TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';

const handleParameter = (obj: ParameterOp, match: RegExpMatchArray) => {
  const ret = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (typeof v === 'function') {
        const val = v(match);
        return [k, val];
      }

      if (typeof v === 'object' && k !== 'expand') {
        // TODO: This as seems funky
        return [k, handleParameter(v as unknown as ParameterOp, match)];
      }

      return [k, v];
    }),
  ) as ParameterOp;

  if (ret.expand) {
    for (const prop of ret.expand as string[]) {
      const ast = bashParser(ret[prop] as string, { mode: 'word-expansion' });
      // console.log('expand', ret[prop], ast.commands[0].name);
      (ret as any)[prop] = (ast.commands[0] as AstNodeCommand).name;
    }

    delete ret.expand;
  }

  return ret;
};

const expandParameter = (xp: Expansion, enums: Enums) => {
  const parameter = xp.parameter;

  for (const pair of Object.entries(enums.parameterOperators)) {
    const re = new RegExp(pair[0]);
    const match = parameter!.match(re);

    if (match) {
      const opProps = handleParameter(pair[1], match);
      const mergedObject = Object.assign({}, xp, opProps);

      return Object.fromEntries(
        Object.entries(mergedObject).filter(([_k, v]) => v !== undefined),
      );
    }
  }

  return xp;
};

/**
 * RULE 5 - If the current character is an unquoted '$' or '`',
 * the shell shall identify the start of any candidates for
 * parameter expansion (Parameter Expansion), command substitution
 * (Command Substitution), or arithmetic expansion (Arithmetic
 * Expansion) from their introductory unquoted character sequences:
 * '$' or "${", "$(" * or '`', and "$((", respectively.
 */
const parameterExpansion: LexerPhase = (ctx) =>
  map((token: TokenIf) => {
    if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
      if (!token.expansion || token.expansion.length === 0) {
        return token;
      }

      return token.setExpansion(
        token.expansion!.map((xp: Expansion) => {
          if (xp.type === 'parameter_expansion') {
            return expandParameter(xp, ctx.enums);
          }

          return xp;
        }),
      );
    }
    return token;
  });

export default parameterExpansion;
