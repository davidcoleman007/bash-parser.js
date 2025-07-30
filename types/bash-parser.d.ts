declare module '@isdk/bash-parser' {
  export interface BashParserAST {
    type: string;
    loc?: {
      start: { line: number; column: number };
      end: { line: number; column: number };
    };
    [key: string]: any;
  }

  export interface Options {
    mode?: string;
    insertLOC?: boolean;
    resolveAlias?: (name: string) => Promise<string | undefined>;
    resolveEnv?: (name: string) => Promise<string | null>;
    resolvePath?: (text: string) => Promise<string>;
    resolveHomeUser?: (username: string | null) => Promise<string>;
    resolveParameter?: (parameter: string) => Promise<string>;
    execCommand?: (command: string, scriptAST: any) => Promise<string>;
    runArithmeticExpression?: (expression: string, arithmeticAST: any) => Promise<string>;
  }

  export function parse(source: string, options?: Options): Promise<BashParserAST>;
}