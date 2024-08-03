

import shellLexer from './shell-lexer.js';
import utils from './utils/index.js';
import modeBash from './modes/bash/index.js';
import modePosix from './modes/posix/index.js';
import modeWordExpansion from './modes/word-expansion/index.js';

// preload all modes to have them browserified


export const loadPlugin = (name) => {
	const modes = {
		'bash': modeBash,
		'posix': modePosix,
		'word-expansion': modeWordExpansion
	};

	const modePlugin = modes[name];

	if (modePlugin.inherits) {
		return modePlugin.init(loadPlugin(modePlugin.inherits), utils);
	}

	return modePlugin.init(null, utils);
}

export const parse = (sourceCode, options) => {
	try {
		options = options || {};
		options.mode = options.mode || 'posix';

		const mode = loadPlugin(options.mode);
		const Parser = mode.grammar.Parser;
		const astBuilder = mode.astBuilder;
		const parser = new Parser();
		parser.lexer = shellLexer(mode, options);
		parser.yy = astBuilder(options);

		const ast = parser.parse(sourceCode);

/*
		const fixtureFolder = `${__dirname}/../test/fixtures`;
		const json = require('json5');
		const {writeFileSync} = require('fs');

		const fileName = require('node-uuid').v4();
		const filePath = `${fixtureFolder}/${fileName}.js`;
		writeFileSync(filePath, 'module.exports = ' + json.stringify({
			sourceCode, result: ast
		}, null, '\t'));
*/
		return ast;
	} catch (err) {
		if (err instanceof SyntaxError) {
			throw err;
		}
		throw new Error(err.stack || err.message);
	}
};

export default parse;