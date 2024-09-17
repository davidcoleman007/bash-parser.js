[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeFor

# Type Alias: AstNodeFor

> **AstNodeFor**: [`AstNode`](AstNode.md) & `object`

A `For` statement. The for loop shall execute a sequence of commands for each member in a list of items.

## Type declaration

### do

> **do**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### name

> **name**: [`AstNodeName`](AstNodeName.md)

### type

> **type**: `"For"`

### wordlist?

> `optional` **wordlist**: [`AstNodeWord`](AstNodeWord.md)[]

## Defined in

[ast/types.ts:142](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L142)
