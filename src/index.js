/**
 * BashCodeshift - A JavaScript codemod toolkit for bash scripts
 * @module bashcodeshift
 */

const { parse, traverse, generate } = require('bash-traverse');
const Transformer = require('./core/transformer');
const Runner = require('./core/runner');
const utils = require('./core/utils');

module.exports = {
  parse,
  traverse,
  generate,
  Transformer,
  Runner,
  utils,

  // Convenience methods
  transform: (source, visitor) => new Transformer().transform(source, visitor),
  run: (transformPath, filePaths, options) => new Runner().run(transformPath, filePaths, options)
};