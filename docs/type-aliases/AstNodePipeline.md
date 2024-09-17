[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodePipeline

# Type Alias: AstNodePipeline

> **AstNodePipeline**: [`AstNode`](AstNode.md) & `object`

`Pipeline` represents a list of commands concatenated with pipes.

 Commands are executed in parallel and the output of each one become the input of the subsequent.

## Type declaration

### commands

> **commands**: ([`AstNodeCommand`](AstNodeCommand.md) \| [`AstNodeFunction`](AstNodeFunction.md) \| [`AstNodeSubshell`](AstNodeSubshell.md) \| [`AstNodeFor`](AstNodeFor.md) \| [`AstNodeCase`](AstNodeCase.md) \| [`AstNodeIf`](AstNodeIf.md) \| [`AstNodeWhile`](AstNodeWhile.md) \| [`AstNodeUntil`](AstNodeUntil.md))[]

### type

> **type**: `"Pipeline"`

## Defined in

[ast/types.ts:49](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L49)
