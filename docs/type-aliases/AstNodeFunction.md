[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstNodeFunction

# Type Alias: AstNodeFunction

> **AstNodeFunction**: [`AstNode`](AstNode.md) & `object`

`Function` represents the definition of a Function.

It is formed by the name of the Function itself and a list of all command that forms the body of the Function. It can also contains a list of redirection that applies to all commands of the function body.

## Type declaration

### body

> **body**: [`AstNodeCompoundList`](AstNodeCompoundList.md)

### name

> **name**: [`AstNodeName`](AstNodeName.md)

### redirections?

> `optional` **redirections**: [`AstNodeRedirect`](AstNodeRedirect.md)[]

### type

> **type**: `"Function"`

## Defined in

[ast/types.ts:93](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L93)
