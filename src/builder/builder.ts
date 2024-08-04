import * as path from '@std/path';
import { Jison } from 'jison';
import grammar from '~/modes/posix/grammar.js';

try {
  console.log(`Building grammar...`);

  const outPath = path.resolve(import.meta.dirname!, '..', '..', 'gen', 'grammar.js');
  const parser = new Jison.Parser(grammar);
  let source = parser.generate({ moduleType: 'js' });

  // Do some magic to make the generated parser work as an ESM module
  // and ignore any lint errors. Also remove the _token_stack label
  // since it is unused and produces a warning.
  source = `
// deno-lint-ignore-file
${source.replace('_token_stack:', '')}
// ESM export
export {parser};
export const Parser = parser.Parser;
export const parse = function () { return parser.parse.apply(parser, arguments); };
`;

  console.log('Grammar compiled.');

  await Deno.writeTextFile(outPath, source);

  console.log(`Grammar saved to ${outPath}.`);
} catch (err) {
  console.error(`Failed to compile grammar: \n${err}`);
  Deno.exit(1);
}
