[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / AstParameterExpansion

# Type Alias: AstParameterExpansion

> **AstParameterExpansion**: `object`

A `ParameterExpansion` represent a parameter expansion operation to perform on the Word.

The `op` and `Word` properties represents, in the case of special parameters, respectively the operator used and the right Word of the special parameter.

The `loc.start` property contains the index of the character in the Word text where the substitution starts. The `loc.end` property contains the index where it the ends.

## Type declaration

### kind?

> `optional` **kind**: `string`

### loc

> **loc**: `ExpansionLocation`

### op?

> `optional` **op**: `string`

### parameter

> **parameter**: `string`

### resolved

> **resolved**: `boolean`

### type

> **type**: `"ParameterExpansion"`

### word?

> `optional` **word**: `string`

## Defined in

[ast/types.ts:268](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/ast/types.ts#L268)
