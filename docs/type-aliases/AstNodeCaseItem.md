[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeCaseItem

# Type Alias: AstNodeCaseItem

> **AstNodeCaseItem**: [`AstNode`](AstNode.md) & `object`

`CaseItem` represents a single pattern item in a `Cases` list of a Case. It's formed by the pattern to match against and the corresponding set of statements to execute if it is matched.

## Type declaration

### body

> **body**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### pattern

> **pattern**: [`AstNodeWord`](AstNodeWord.md)[]

### type

> **type**: `"CaseItem"`

## Defined in

[ast/types.ts:162](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L162)
