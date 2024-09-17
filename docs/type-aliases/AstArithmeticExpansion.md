[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstArithmeticExpansion

# Type Alias: AstArithmeticExpansion

> **AstArithmeticExpansion**: `object`

A `ArithmeticExpansion` represent an arithmetic expansion operation to perform in the Word.

The parsing of the arithmetic expression is done using [Babel parser](https://babeljs.io/docs/babel-parser). See there for the `arithmeticAST` node specification.

The `loc.start` property contains the index of the character in the Word text where the substitution starts. The `loc.end` property contains the index where it the ends.

## Type declaration

### arithmeticAST

> **arithmeticAST**: [`AstNode`](AstNode.md)

### expression

> **expression**: `string`

### loc

> **loc**: `ExpansionLocation`

### resolved

> **resolved**: `boolean`

### type

> **type**: `"ArithmeticExpansion"`

## Defined in

[ast/types.ts:237](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L237)
