[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeAssignmentWord

# Type Alias: AstNodeAssignmentWord

> **AstNodeAssignmentWord**: [`AstNode`](AstNode.md) & `object`

A special kind of Word that represents assignment of a value to an environment variable.

## Type declaration

### expansion

> **expansion**: ([`AstArithmeticExpansion`](AstArithmeticExpansion.md) \| [`AstCommandExpansion`](AstCommandExpansion.md) \| [`AstParameterExpansion`](AstParameterExpansion.md))[]

### text

> **text**: `string`

### type

> **type**: `"AssignmentWord"`

## Defined in

[ast/types.ts:220](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L220)
