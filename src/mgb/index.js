import fs from "node:fs";
import path from "node:path";
import { Jison } from "jison";
import { loadPlugin } from "../index.js";

const build = (modesFolder, modeName) => {
  const builtGrammarPath = path.resolve(
    modesFolder,
    modeName,
    "built-grammar.js",
  );
  console.log(`Building grammar from ${modeName}...`);

  const mode = loadPlugin(modeName);
  console.log("Mode module loaded.");
  let parserSource;
  try {
    const parser = new Jison.Parser(mode.grammarSource);
    parserSource = parser.generate();
  } catch (err) {
    console.error(`Cannot compile grammar: \n${err.stack}`);
    process.exit(1);
    return;
  }

  parserSource = `${parserSource}

// ESM export
export {parser};
export const Parser = parser.Parser;
export const parse = function () { return parser.parse.apply(parser, arguments); };

`;

  console.log("Mode grammar compiled.");
  fs.writeFile(builtGrammarPath, parserSource, (err) => {
    if (err) {
      console.error(`Cannot write compiled grammar to file: \n${err.stack}`);
      process.exit(1);
      return;
    }
    console.log(`Mode grammar saved to ${builtGrammarPath}.`);
  });
};

const args = process.argv.slice(2);

if (args.length === 2) {
  build(args[0], args[1])
} else {
  console.error(`Usage: mgb <modes folder> <mode name>`);
  process.exit(1);
}
