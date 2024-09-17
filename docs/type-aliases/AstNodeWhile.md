[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeWhile

# Type Alias: AstNodeWhile

> **AstNodeWhile**: [`AstNode`](AstNode.md) & `object`

A `While` statement. The While loop shall continuously execute one CompoundList as long as another CompoundList has a zero exit status.

## Type declaration

### clause

> **clause**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### do

> **do**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### type

> **type**: `"While"`

## Defined in

[ast/types.ts:181](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L181)
