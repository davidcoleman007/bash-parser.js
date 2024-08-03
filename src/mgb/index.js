'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Jison } = require('jison');

const args = process.argv.slice(2);

if (args.length === 2) {
    build(args[0], args[1]);
} else {
    console.error(`Usage: mgb <modes folder> <mode name>`);
    process.exit(1);
}

function loadPlugin(modesFolder, modeName, utils) {
    const modePath = path.resolve(modesFolder, modeName);
    const modePlugin = require(modePath);

    if (modePlugin.inherits) {
        return modePlugin.init(loadPlugin(modesFolder, modePlugin.inherits, utils), utils);
    }
    return modePlugin.init(null, utils);
}

function build(modesFolder, modeName) {
    const modeModule = path.resolve(modesFolder, modeName, 'index.js');
    const builtGrammarPath = path.resolve(modesFolder, modeName, 'built-grammar.js');
    const utilsPath = path.resolve(modesFolder, '..', 'utils');
    const utils = require(utilsPath);
    console.log(`Building grammar from ${modeModule}...`);

    const mode = loadPlugin(modesFolder, modeName, utils);
    console.log('Mode module loaded.');
    let parserSource;
    try {
        const parser = new Jison.Parser(mode.grammarSource);
        parserSource = parser.generate();
    } catch (err) {
        console.error(`Cannot compile grammar: \n${err.stack}`);
        process.exit(1);
        return;
    }

    console.log('Mode grammar compiled.');
    fs.writeFile(builtGrammarPath, parserSource, err => {
        if (err) {
            console.error(`Cannot write compiled grammar to file: \n${err.stack}`);
            process.exit(1);
            return;
        }
        console.log(`Mode grammar saved to ${builtGrammarPath}.`);
    });
}