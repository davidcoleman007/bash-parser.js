import type { Expansion, LexerPhase, ParameterOp, TokenIf } from '~/types.ts';
import map from '~/utils/iterable/map.ts';
import tokens from '~/utils/tokens.ts';
import bashParser from '../../../parse.ts';

const handleParameter = (obj: ParameterOp, match: RegExpMatchArray) => {
  const ret = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (typeof v === 'function') {
        const val = v(match);
        return [k, val];
      }

      if (typeof v === 'object' && k !== 'expand') {
        return [k, handleParameter(v as ParameterOp, match)];
      }

      return [k, v];
    }),
  ) as ParameterOp;

  if (ret.expand) {
    for (const prop of ret.expand) {
      const ast = bashParser(ret[prop] as string, { mode: 'word-expansion' });
      ret[prop] = ast.commands[0].name;
    }

    delete ret.expand;
  }

  return ret;
};

const expandParameter = (xp: Expansion, enums) => {
  let parameter = xp.parameter;

  for (const pair of Object.entries(enums.parameterOperators)) {
    const re = new RegExp(pair[0]);

    const match = parameter.match(re);

    if (match) {
      const opProps = handleParameter(pair[1], match);

      const mergedObject = Object.assign({}, xp, opProps);
      const filteredObject = Object.fromEntries(
        Object.entries(mergedObject).filter(([k, v]) => v !== undefined),
      );
      return filteredObject;
    }
  }

  return xp;
};

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.
const parameterExpansion: LexerPhase = (_options, mode) => (map((token: TokenIf) => {
  if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
    if (!token.expansion || token.expansion.length === 0) {
      return token;
    }

    return tokens.setExpansions(
      token,
      token.expansion!.map((xp: Expansion) => {
        if (xp.type === 'parameter_expansion') {
          return expandParameter(xp, mode.enums);
        }

        return xp;
      }),
    );
  }
  return token;
}));

export default parameterExpansion;
