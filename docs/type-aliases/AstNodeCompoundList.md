[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeCompoundList

# Type Alias: AstNodeCompoundList

> **AstNodeCompoundList**: [`AstNode`](AstNode.md) & `object`

`CompoundList` represent a group of commands that form the body of `for`, `until` `while`, `if`, `else`, `case` items and `function` command. It can also represent a simple group of commands, with an optional list of redirections.

## Type declaration

### commands

> **commands**: ([`AstNodeLogicalExpression`](AstNodeLogicalExpression.md) \| [`AstNodePipeline`](AstNodePipeline.md) \| [`AstNodeCommand`](AstNodeCommand.md) \| [`AstNodeFunction`](AstNodeFunction.md) \| [`AstNodeSubshell`](AstNodeSubshell.md) \| [`AstNodeFor`](AstNodeFor.md) \| [`AstNodeCase`](AstNodeCase.md) \| [`AstNodeIf`](AstNodeIf.md) \| [`AstNodeWhile`](AstNodeWhile.md) \| [`AstNodeUntil`](AstNodeUntil.md))[]

### redirections?

> `optional` **redirections**: [`AstNodeRedirect`](AstNodeRedirect.md)[]

### type

> **type**: `"CompoundList"`

## Defined in

[ast/types.ts:113](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L113)
