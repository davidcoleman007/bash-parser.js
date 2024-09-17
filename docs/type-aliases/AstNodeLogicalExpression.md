[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeLogicalExpression

# Type Alias: AstNodeLogicalExpression

> **AstNodeLogicalExpression**: [`AstNode`](AstNode.md) & `object`

`LogicalExpression` represents two commands (left and right) concateneted in a `and` (&&) or `or` (||) operation.

In the `and` Case, the right command is executed only if the left one is executed successfully. In the `or` Case, the right command is executed only if the left one fails.

## Type declaration

### left

> **left**: [`AstNode`](AstNode.md)

### op

> **op**: `"and"` \| `"or"`

### right

> **right**: [`AstNode`](AstNode.md)

### type

> **type**: `"LogicalExpression"`

## Defined in

[ast/types.ts:68](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L68)
