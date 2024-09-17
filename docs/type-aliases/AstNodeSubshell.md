[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeSubshell

# Type Alias: AstNodeSubshell

> **AstNodeSubshell**: [`AstNode`](AstNode.md) & `object`

`Subshell` node represents a Subshell command. It consist of a group of one or more commands to execute in a separated shell environment.

## Type declaration

### async?

> `optional` **async**: `boolean`

### list

> **list**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### type

> **type**: `"Subshell"`

## Defined in

[ast/types.ts:133](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L133)
