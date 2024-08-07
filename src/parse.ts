import { astBuilder } from '~/ast/mod.ts';
import { grammar } from '~/grammar/mod.ts';
import type { Mode, ModePlugin, Options } from '~/types.ts';
import { Lexer } from './lexer/mod.ts';
import modeBash from './modes/bash/index.ts';
import modeWordExpansion from './modes/word-expansion/index.ts';

const loadPlugin = (name: string): Mode => {
  const modes: Record<string, ModePlugin> = {
    'bash': modeBash,
    'word-expansion': modeWordExpansion,
  };

  const modePlugin = modes[name];

  if (modePlugin.inherits) {
    return modePlugin.init(loadPlugin(modePlugin.inherits));
  }

  return modePlugin.init();
};

export const parse = (sourceCode: string, options?: Options) => {
  try {
    options = options || {};
    options.mode = options.mode || 'bash';

    const mode = loadPlugin(options.mode);
    const parser = new grammar.Parser();
    parser.lexer = new Lexer(mode, options);
    parser.yy = astBuilder(options.insertLOC);

    return parser.parse(sourceCode);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw err;
    }
    throw new Error(err.stack || err.message);
  }
};

export default parse;
