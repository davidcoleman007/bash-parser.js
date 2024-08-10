import type { AstNodeCommand } from '~/ast/types.ts';
import type { LexerPhase } from '~/lexer/types.ts';
import type { Enums, ParameterOp } from '~/modes/types.ts';
import bashParser from '~/parse.ts';
import type { Expansion, TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';

const handleParameter = async (obj: ParameterOp, match: RegExpMatchArray) => {
  const ret = Object.fromEntries(
    await Promise.all(
      Object.entries(obj).map(async ([k, v]) => {
        if (typeof v === 'function') {
          const val = v(match);
          return [k, val];
        }

        if (typeof v === 'object' && k !== 'expand') {
          // TODO: This as seems funky
          return [k, await handleParameter(v as unknown as ParameterOp, match)];
        }

        return [k, v];
      }),
    ),
  ) as ParameterOp;

  if (ret.expand) {
    for (const prop of ret.expand as string[]) {
      const ast = await bashParser(ret[prop] as string, { mode: 'word-expansion' });
      // console.log('expand', ret[prop], ast.commands[0].name);
      (ret as any)[prop] = (ast.commands[0] as AstNodeCommand).name;
    }

    delete ret.expand;
  }

  return ret;
};

const expandParameter = async (xp: Expansion, enums: Enums) => {
  const parameter = xp.parameter;

  for (const pair of Object.entries(enums.parameterOperators)) {
    const re = new RegExp(pair[0]);
    const match = parameter!.match(re);

    if (match) {
      const opProps = await handleParameter(pair[1], match);
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
  map(async (token: TokenIf) => {
    if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
      if (!token.expansion || token.expansion.length === 0) {
        return token;
      }

      return token.setExpansion(
        await Promise.all(
          token.expansion!.map(async (xp: Expansion) => {
            if (xp.type === 'parameter_expansion') {
              return await expandParameter(xp, ctx.enums);
            }

            return xp;
          }),
        ),
      );
    }
    return token;
  });

export default parameterExpansion;
