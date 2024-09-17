[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / Options

# Type Alias: Options

> **Options**: [`Resolvers`](Resolvers.md) & `object`

The options to use for controlling how the parsing is done.

## Type declaration

### insertLOC?

> `optional` **insertLOC**: `boolean`

If `true`, includes lines and columns information in the source file.

### mode?

> `optional` **mode**: `string`

Which mode to use for the parsing. The mode specifies the tokenizer, lexer phases, grammar, and AST builder to use. Default is `bash`.

## Defined in

[types.ts:77](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/types.ts#L77)
