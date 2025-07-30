// Main exports for bashcodeshift
export { b, BashCodeshiftAPI } from './core/api';
export { TransformRunner, TransformFunction, TransformAPI } from './core/runner';
export { FileManager, FileInfo } from './core/file-manager';

// Re-export types from bash-traverse for convenience
export type {
  Program,
  ASTNode,
  NodePath,
  Visitor,
  Command,
  VariableAssignment,
  FunctionDefinition,
  IfStatement,
  ForStatement,
  WhileStatement,
  Pipeline,
  Comment,
  Word
} from 'bash-traverse';