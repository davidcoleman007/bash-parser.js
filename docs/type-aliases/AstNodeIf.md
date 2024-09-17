[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeIf

# Type Alias: AstNodeIf

> **AstNodeIf**: [`AstNode`](AstNode.md) & `object`

A `If` statement. The if command shall execute a CompoundList and use its exit status to determine whether to execute the `then` CompoundList or the optional `else` one.

## Type declaration

### clause

> **clause**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### else?

> `optional` **else**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### then

> **then**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### type

> **type**: `"If"`

## Defined in

[ast/types.ts:171](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L171)
