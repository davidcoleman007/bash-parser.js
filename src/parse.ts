import type { Mode, ModePlugin, Options } from '~/types.ts';
import utils from '~/utils/index.ts';
import modeBash from './modes/bash/index.ts';
import modePosix from './modes/posix/index.ts';
import modeWordExpansion from './modes/word-expansion/index.ts';
import shellLexer from './shell-lexer.ts';

const loadPlugin = (name: string): Mode => {
	const modes: Record<string, ModePlugin> = {
		'bash': modeBash,
		'posix': modePosix,
		'word-expansion': modeWordExpansion,
	};

	const modePlugin = modes[name];

	if (modePlugin.inherits) {
		return modePlugin.init(utils, loadPlugin(modePlugin.inherits));
	}

	return modePlugin.init(utils);
};

export const parse = (sourceCode: string, options?: Options) => {
	try {
		options = options || {};
		options.mode = options.mode || 'posix';

		const mode = loadPlugin(options.mode);

		const parser = new mode.grammar.Parser();
		parser.lexer = shellLexer(mode, options);
		parser.yy = mode.astBuilder(options);

		return parser.parse(sourceCode);
	} catch (err) {
		if (err instanceof SyntaxError) {
			throw err;
		}
		throw new Error(err.stack || err.message);
	}
};

export default parse;
