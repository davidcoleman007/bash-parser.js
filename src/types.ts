/**
 * Type definitions for bashcodeshift
 */

// AST Node Types
export interface ASTNode {
  type: string;
  loc?: Location;
}

export interface Location {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
}

export interface CommandNode extends ASTNode {
  type: 'Command';
  name: string;
  arguments: string[];
}

export interface VariableNode extends ASTNode {
  type: 'Variable';
  name: string;
  value: string;
}

export interface ConditionalNode extends ASTNode {
  type: 'Conditional';
  condition: string;
  consequent: ASTNode[];
  alternate?: ASTNode[] | null;
}

export interface LoopNode extends ASTNode {
  type: 'Loop';
  kind: 'for' | 'while' | 'until';
  variable?: string;
  condition?: string;
  body: ASTNode[];
}

export interface FunctionNode extends ASTNode {
  type: 'Function';
  name: string;
  body: ASTNode[];
}

export interface PipelineNode extends ASTNode {
  type: 'Pipeline';
  commands: CommandNode[];
}

export interface CommentNode extends ASTNode {
  type: 'Comment';
  value: string;
}

export interface ProgramNode extends ASTNode {
  type: 'Program';
  body: ASTNode[];
  sourceType: 'script';
}

// API Types
export interface FileInfo {
  source: string;
  path: string;
}

/**
 * Transform API provided to transform functions
 */
export interface TransformAPI {
  b: (source: string) => BashCodeshiftAPI;
  stats: TransformStats;
  report: (message: string) => void;
}

export interface TransformStats {
  processed: number;
  changed: number;
  errors: number;
}

/**
 * bashcodeshift API interface
 */
export interface BashCodeshiftAPI {
  // AST node constructors
  Command: (props: Partial<CommandNode>) => CommandNode;
  Variable: (props: Partial<VariableNode>) => VariableNode;
  Conditional: (props: Partial<ConditionalNode>) => ConditionalNode;
  Loop: (props: Partial<LoopNode>) => LoopNode;
  Function: (props: Partial<FunctionNode>) => FunctionNode;
  Pipeline: (props: Partial<PipelineNode>) => PipelineNode;
  Comment: (props: Partial<CommentNode>) => CommentNode;

  // Collection methods
  find: (nodeType: string, filter?: Record<string, any>) => NodePath[];
  filter: (collection: NodePath[], predicate: (path: NodePath) => boolean) => NodePath[];
  forEach: (collection: NodePath[], callback: (path: NodePath) => void) => void;
  map: <T>(collection: NodePath[], callback: (path: NodePath) => T) => T[];

  // Node manipulation
  replace: (path: NodePath, newNode: ASTNode) => void;
  insertBefore: (path: NodePath, newNode: ASTNode) => void;
  insertAfter: (path: NodePath, newNode: ASTNode) => void;
  remove: (path: NodePath) => void;

  // Source generation
  toSource: (options?: SourceOptions) => string;
}

export interface NodePath {
  value: ASTNode;
  path: PathItem[];
  replace: (newNode: ASTNode) => void;
  insertBefore: (newNode: ASTNode) => void;
  insertAfter: (newNode: ASTNode) => void;
  remove: () => void;
}

export interface PathItem {
  node: ASTNode;
  index: number;
}

export interface SourceOptions {
  quote?: 'single' | 'double';
  indent?: number;
}

// Transform Function Type
export type TransformFunction = (
  fileInfo: FileInfo,
  api: TransformAPI,
  options: Record<string, any>
) => string | Promise<string>;

// Runner Types
export interface RunnerOptions {
  dry?: boolean;
  print?: boolean;
  verbose?: boolean;
  ignorePattern?: string;
  parser?: string;
}

export interface RunnerStats {
  processed: number;
  changed: number;
  errors: number;
}

// Parser Types
export interface ParserOptions {
  sourceType?: 'script' | 'module';
}

// Utility Types
export interface ParsedArguments {
  options: Record<string, any>;
  positional: string[];
}

export type CommandType = 'builtin' | 'common' | 'custom';

// Tree-sitter Types
export interface TreeSitterNode {
  type: string;
  text: string;
  startPosition: TreeSitterPosition;
  endPosition: TreeSitterPosition;
  startIndex: number;
  endIndex: number;
  children: TreeSitterNode[];
}

export interface TreeSitterPosition {
  row: number;
  column: number;
}