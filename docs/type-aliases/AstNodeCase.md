[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeCase

# Type Alias: AstNodeCase

> **AstNodeCase**: [`AstNode`](AstNode.md) & `object`

A `Case` statement. The conditional construct Case shall execute the CompoundList corresponding to the first one of several patterns that is matched by the `clause` Word.

## Type declaration

### cases?

> `optional` **cases**: [`AstNodeCaseItem`](AstNodeCaseItem.md)[]

### clause

> **clause**: [`AstNodeWord`](AstNodeWord.md)

### type

> **type**: `"Case"`

## Defined in

[ast/types.ts:153](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L153)
