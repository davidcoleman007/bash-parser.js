# Function Body Parsing Refactor

## Problem Analysis

### Current Issue
Function bodies are not parsing correctly. Commands like `echo "hello"` are being parsed as:
- Command name: `"hello"` (incorrect)
- Arguments: empty array (incorrect)

Instead of:
- Command name: `echo` (correct)
- Arguments: `"hello"` (correct)

### Root Cause
The current `CompoundList` approach creates artificial parsing boundaries that interfere with normal statement parsing flow. The parser behaves differently when parsing function bodies vs. top-level code.

## Babel-Inspired Solution

### Key Insight from Babel
Babel uses the same `BlockStatement` structure for all block contexts:
- Function bodies → `BlockStatement`
- If statement bodies → `BlockStatement`
- Loop bodies → `BlockStatement`
- All use the same parsing logic

### Proposed Architecture
Replace `CompoundList` with simple `Statement[]` arrays everywhere:

```typescript
interface FunctionDefinition extends ASTNode {
  type: 'FunctionDefinition';
  name: Word;
  body: Statement[];  // ← Simple array instead of CompoundList
  hasParentheses?: boolean;
}

interface IfStatement extends ASTNode {
  type: 'IfStatement';
  condition: Statement[];
  thenBody: Statement[];
  elseBody?: Statement[];
}
```

## Bash-Specific Considerations

### Whitespace Sensitivity
Bash is highly sensitive to whitespace and formatting:

```bash
# These are different:
VAR=value    # Assignment
VAR = value  # Command with arguments

# These are different:
if [ $x -eq 1 ]; then  # Valid
if[$x -eq 1];then      # Invalid
```

### Statement Types Needed
```typescript
type Statement =
  | Command
  | Pipeline
  | IfStatement
  | ForStatement
  | WhileStatement
  | UntilStatement
  | CaseStatement
  | FunctionDefinition
  | Subshell
  | BraceGroup
  | Comment
  | Shebang
  | NewlineStatement
  | SemicolonStatement;
```

### Whitespace Handling Strategy

#### 1. Implicit Space Handling (most cases)
- Most spaces are just separators, handled implicitly
- `"echo hello world"` → `[Command("echo", ["hello", "world"])]`

#### 2. Explicit Space Tracking (critical cases)
- Track spaces around critical operators (`=`, `[`, `]`, `{`, `}`)
- Store indentation as a property on statements

#### 3. Format Preservation
```typescript
interface Statement extends ASTNode {
  type: 'Command' | 'Pipeline' | /* ... */;
  indentation?: string;  // Store actual indentation
}

interface Command extends ASTNode {
  type: 'Command';
  name: Word;
  arguments: Word[];
  redirects: Redirect[];
  hasSpaceBefore?: boolean;  // Track critical spaces
  hasSpaceAfter?: boolean;
}
```

## Implementation Plan

### Phase 1: Update Types
1. Replace `CompoundList` with `Statement[]` in all interfaces
2. Add `NewlineStatement` and `SemicolonStatement` types
3. Add whitespace tracking properties

### Phase 2: Update Parser
1. Modify `parseFunctionDefinition()` to use `Statement[]`
2. Update `parseStatement()` to handle new statement types
3. Implement whitespace-aware parsing for critical operators

### Phase 3: Update Generator
1. Modify code generation to handle `Statement[]` arrays
2. Implement whitespace preservation in output
3. Handle indentation and formatting

### Phase 4: Update All Block Contexts
1. Update if statements, loops, case statements
2. Ensure consistent parsing across all contexts
3. Test complex nested structures

## Benefits

1. **Fixes Function Body Parsing**: Eliminates context-specific parsing bugs
2. **Simplifies Architecture**: One parsing logic for all block contexts
3. **Preserves Bash Formatting**: Maintains exact whitespace and indentation
4. **Follows Proven Pattern**: Based on Babel's successful approach
5. **Easier Maintenance**: Consistent parsing logic across the codebase

## Migration Strategy

1. **Incremental Refactor**: Update one block type at a time
2. **Maintain Backwards Compatibility**: Keep existing interfaces during transition
3. **Comprehensive Testing**: Test all existing functionality after each change
4. **Documentation Updates**: Update all relevant documentation

## Success Criteria

- [ ] Function bodies parse correctly (command names and arguments)
- [ ] All existing functionality continues to work
- [ ] Complex nested structures (if/for/while) work correctly
- [ ] Whitespace and formatting are preserved exactly
- [ ] Code generation produces identical output for identical input