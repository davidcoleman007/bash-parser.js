[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeScript

# Type Alias: AstNodeScript

> **AstNodeScript**: [`AstNode`](AstNode.md) & `object`

`Script` is the root node of the AST. It simply represent a list of commands that form the body of the script.

## Type declaration

### commands

> **commands**: ([`AstNodeLogicalExpression`](AstNodeLogicalExpression.md) \| [`AstNodePipeline`](AstNodePipeline.md) \| [`AstNodeCommand`](AstNodeCommand.md) \| [`AstNodeFunction`](AstNodeFunction.md) \| [`AstNodeSubshell`](AstNodeSubshell.md) \| [`AstNodeFor`](AstNodeFor.md) \| [`AstNodeCase`](AstNodeCase.md) \| [`AstNodeIf`](AstNodeIf.md) \| [`AstNodeWhile`](AstNodeWhile.md) \| [`AstNodeUntil`](AstNodeUntil.md))[]

### type

> **type**: `"Script"`

## Defined in

[ast/types.ts:28](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L28)
