[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeWord

# Type Alias: AstNodeWord

> **AstNodeWord**: [`AstNode`](AstNode.md) & `object`

A `Word` node could appear various part of the AST. It's formed by a series of characters, and is subjected to `tilde expansion`, `parameter expansion`, `command substitution`, `arithmetic expansion`, `pathName expansion`, `field splitting` and `quote removal`.

## Type declaration

### expansion

> **expansion**: ([`AstArithmeticExpansion`](AstArithmeticExpansion.md) \| [`AstCommandExpansion`](AstCommandExpansion.md) \| [`AstParameterExpansion`](AstParameterExpansion.md))[]

### text

> **text**: `string`

### type

> **type**: `"Word"`

## Defined in

[ast/types.ts:207](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L207)
