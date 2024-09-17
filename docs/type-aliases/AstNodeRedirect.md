[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeRedirect

# Type Alias: AstNodeRedirect

> **AstNodeRedirect**: [`AstNode`](AstNode.md) & `object`

A `Redirect` represents the redirection of input or output stream of a command to or from a filename or another stream.

## Type declaration

### file

> **file**: [`AstNodeWord`](AstNodeWord.md)

### numberIo?

> `optional` **numberIo**: [`AstIoNumber`](AstIoNumber.md)

### op

> **op**: [`AstNodeWord`](AstNodeWord.md)

### type

> **type**: `"Redirect"`

## Defined in

[ast/types.ts:197](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L197)
