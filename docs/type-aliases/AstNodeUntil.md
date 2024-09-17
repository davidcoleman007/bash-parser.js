[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeUntil

# Type Alias: AstNodeUntil

> **AstNodeUntil**: [`AstNode`](AstNode.md) & `object`

A `Until` statement. The Until loop shall continuously execute one CompoundList as long as another CompoundList has a non-zero exit status.

## Type declaration

### clause

> **clause**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### do

> **do**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### type

> **type**: `"Until"`

## Defined in

[ast/types.ts:190](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L190)
