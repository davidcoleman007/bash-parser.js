[**@isdk/bash-parser**](../README.md) • **Docs**

***

[@isdk/bash-parser](../globals.md) / Resolvers

# Type Alias: Resolvers

> **Resolvers**: `object`

The resolvers to use by the parsing to resolve external information when needed.

## Type declaration

### execCommand()?

> `optional` **execCommand**: (`command`, `scriptAST`) => `Promise`\<`string`\>

A callback to execute a `simple_command`. If specified, the parser calls it whenever it needs to resolve a command substitution. It receives as argument the AST of a `simple_command` node, and shall return the output of the command. If the option is not specified, the parser won't try to resolve any command substitution.

#### Parameters

• **command**: `string`

The name of the command.

• **scriptAST**: [`AstNodeScript`](AstNodeScript.md)

#### Returns

`Promise`\<`string`\>

The output of the command.

### resolveAlias()?

> `optional` **resolveAlias**: (`name`) => `Promise`\<`string` \| `undefined`\>

A callback to resolve shell alias. If specified, the parser calls it whenever it needs to resolve an alias. It should return the resolved code if the alias exists, otherwise `null`. If the option is not specified, the parser won't try to resolve any alias.

#### Parameters

• **name**: `string`

The name of the alias to resolve.

#### Returns

`Promise`\<`string` \| `undefined`\>

The resolved code if the alias exists, otherwise `null`.

### resolveEnv()?

> `optional` **resolveEnv**: (`name`) => `Promise`\<`string` \| `null`\>

A callback to resolve environment variables. If specified, the parser calls it whenever it needs to resolve an environment variable. It should return the value if the variable is defined, otherwise `null`. If the option is not specified, the parser won't try to resolve any environment variable.

#### Parameters

• **name**: `string`

The name of the environment variable to resolve.

#### Returns

`Promise`\<`string` \| `null`\>

The value if the variable is defined, otherwise `null`.

### resolveHomeUser()?

> `optional` **resolveHomeUser**: (`username`) => `Promise`\<`string`\>

A callback to resolve users' home directories. If specified, the parser calls it whenever it needs to resolve a tilde expansion. If the option is not specified, the parser won't try to resolve any tilde expansion. When the callback is called with a null value for `username`, the callback should return the current user's home directory.

#### Parameters

• **username**: `string` \| `null`

The username whose home directory to resolve, or `null` for the current user.

#### Returns

`Promise`\<`string`\>

The home directory of the specified user, or the current user's home directory if `username` is `null`.

### resolveParameter()?

> `optional` **resolveParameter**: (`parameter`) => `Promise`\<`string`\>

A callback to resolve parameter expansion. If specified, the parser calls it whenever it needs to resolve a parameter expansion. It should return the result of the expansion. If the option is not specified, the parser won't try to resolve any parameter expansion.

#### Parameters

• **parameter**: `string`

The name of the parameter to resolve.

#### Returns

`Promise`\<`string`\>

The result of the parameter expansion.

### resolvePath()?

> `optional` **resolvePath**: (`text`) => `Promise`\<`string`\>

A callback to resolve path globbing. If specified, the parser calls it whenever it needs to resolve path globbing. It should return the expanded path. If the option is not specified, the parser won't try to resolve any path globbing.

#### Parameters

• **text**: `string`

The text to resolve.

#### Returns

`Promise`\<`string`\>

The expanded path.

### runArithmeticExpression()?

> `optional` **runArithmeticExpression**: (`expression`, `arithmeticAST`) => `Promise`\<`string`\>

A callback to execute an `arithmetic_expansion`. If specified, the parser calls it whenever it needs to resolve an arithmetic substitution. It receives as argument the AST of an `arithmetic_expansion` node, and shall return the result of the calculation. If the option is not specified, the parser won't try to resolve any arithmetic expansion substitution. Please note that the arithmetic expression AST is built using [babel/parser](https://babeljs.io/docs/babel-parser), the AST specification can be found there.

#### Parameters

• **expression**: `string`

The arithmetic expression to evaluate.

• **arithmeticAST**: [`AstNode`](AstNode.md)

The AST of the arithmetic expression to evaluate.

#### Returns

`Promise`\<`string`\>

The result of the calculation.

## Defined in

[types.ts:6](https://github.com/mattiasrunge/bash-parser/blob/98089d9104089a44eb5db425f3c3a8de14075f75/src/types.ts#L6)
