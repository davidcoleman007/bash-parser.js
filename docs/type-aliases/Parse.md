[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / Parse

# Type Alias: Parse()

> **Parse**: (`sourceCode`, `options`?) => `Promise`\<[`AstNodeScript`](AstNodeScript.md)\>

Parses a shell script and returns its AST.

## Parameters

• **sourceCode**: `string`

The shell script to parse.

• **options?**: [`Options`](Options.md)

The options to use for the parsing.

## Returns

`Promise`\<[`AstNodeScript`](AstNodeScript.md)\>

The AST of the shell script.

## Defined in

[types.ts:96](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/types.ts#L96)
