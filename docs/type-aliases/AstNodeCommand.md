[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeCommand

# Type Alias: AstNodeCommand

> **AstNodeCommand**: [`AstNode`](AstNode.md) & `object`

`Command` represents a builtin or external command to execute. It could optionally have a list of arguments, stream redirection operation and environment variable assignments.

`name` properties is a Word that represents the name of the command to execute. It is optional because Command could represents bare assignment, e.g. `VARNAME = 42;`. In this case, the command node has no name.

## Type declaration

### async?

> `optional` **async**: `boolean`

### name?

> `optional` **name**: [`AstNodeName`](AstNodeName.md)

### prefix?

> `optional` **prefix**: ([`AstNodeAssignmentWord`](AstNodeAssignmentWord.md) \| [`AstNodeRedirect`](AstNodeRedirect.md))[]

### suffix?

> `optional` **suffix**: ([`AstNodeWord`](AstNodeWord.md) \| [`AstNodeRedirect`](AstNodeRedirect.md))[]

### type

> **type**: `"Command"`

## Defined in

[ast/types.ts:80](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L80)
