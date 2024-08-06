import bashParser from '~/parse.ts';
import type { Expansion, LexerPhase, TokenIf } from '~/types.ts';
import map from '~/utils/iterable/map.ts';
import tokensUtils from '~/utils/tokens.ts';

const setCommandExpansion = (xp: Expansion, token: TokenIf) => {
  let command = xp.command!;

  if (token.value![xp.loc.start - 1] === '`') {
    command = command.replace(/\\`/g, '`');
  }

  const commandAST = bashParser(command);

  // console.log(JSON.stringify({command, commandAST}, null, 4))
  return Object.assign({}, xp, { command, commandAST });
};

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.

const commandExpansion: LexerPhase = () => (map((token: TokenIf) => {
  if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
    if (!token.expansion || token.expansion.length === 0) {
      return token;
    }

    return tokensUtils.setExpansions(
      token,
      token.expansion.map((xp: Expansion) => {
        if (xp.type === 'command_expansion') {
          return setCommandExpansion(xp, token);
        }

        return xp;
      }),
    );
  }
  return token;
}));

export default commandExpansion;
