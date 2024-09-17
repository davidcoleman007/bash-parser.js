[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstSourceLocation

# Type Alias: AstSourceLocation

> **AstSourceLocation**: `object`

If the source is parsed specifing the `insertLOC` option, each node contins a `loc` property that contains the starting and ending lines and columns of the node, and the start and end index of the character in the source string.

## Type declaration

### end

> **end**: [`AstSourcePosition`](AstSourcePosition.md)

### start

> **start**: [`AstSourcePosition`](AstSourcePosition.md)

## Defined in

[ast/types.ts:6](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L6)
