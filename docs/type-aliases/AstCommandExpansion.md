[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstCommandExpansion

# Type Alias: AstCommandExpansion

> **AstCommandExpansion**: `object`

A `CommandExpansion` represent a command substitution operation to perform on the Word.

The parsing of the command is done recursively using `bash-parser` itself.

The `loc.start` property contains the index of the character in the Word text where the substitution starts. The `loc.end` property contains the index where it the ends.

## Type declaration

### command

> **command**: `string`

### commandAST

> **commandAST**: [`AstNodeScript`](AstNodeScript.md)

### loc

> **loc**: `ExpansionLocation`

### resolved

> **resolved**: `boolean`

### type

> **type**: `"CommandExpansion"`

## Defined in

[ast/types.ts:252](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L252)
