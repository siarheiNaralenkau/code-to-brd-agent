/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import Parser from 'tree-sitter';
const TypeScript = require('tree-sitter-typescript') as { typescript: unknown; tsx: unknown };
const JavaScript = require('tree-sitter-javascript') as unknown;
const Python = require('tree-sitter-python') as unknown;
const Java = require('tree-sitter-java') as unknown;
const Go = require('tree-sitter-go') as unknown;
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import path from 'path';
import { FileParseSummary, ParseResponse } from '../types';
import { walkFiles, readFileSafe } from '../utils/file.utils';
import { chunkByLayer, buildFullAstSummary } from '../utils/ast-chunker.utils';

const EXT_TO_LANG: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.go': 'go',
};

export class TreeSitterParserService {
  private parsers = new Map<string, Parser>();

  constructor() {
    this.initParsers();
  }

  private initParsers(): void {
    const tsParser = new Parser();
    tsParser.setLanguage(TypeScript.typescript);
    this.parsers.set('typescript', tsParser);

    const tsxParser = new Parser();
    tsxParser.setLanguage(TypeScript.tsx);
    this.parsers.set('tsx', tsxParser);

    const jsParser = new Parser();
    jsParser.setLanguage(JavaScript);
    this.parsers.set('javascript', jsParser);

    const pyParser = new Parser();
    pyParser.setLanguage(Python);
    this.parsers.set('python', pyParser);

    const javaParser = new Parser();
    javaParser.setLanguage(Java);
    this.parsers.set('java', javaParser);

    const goParser = new Parser();
    goParser.setLanguage(Go);
    this.parsers.set('go', goParser);
  }

  async parseRepository(repoPath: string): Promise<ParseResponse> {
    const extensions = new Set(Object.keys(EXT_TO_LANG));
    const files = await walkFiles(repoPath, extensions);

    const parsedFiles: FileParseSummary[] = [];
    const languageSet = new Set<string>();

    for (const filePath of files) {
      const ext = path.extname(filePath).toLowerCase();
      const language = EXT_TO_LANG[ext];
      if (!language) continue;

      const content = await readFileSafe(filePath);
      if (!content) continue;

      // Skip very large files to avoid memory issues
      if (content.length > 500_000) continue;

      const summary = this.parseFile(filePath, content, language, repoPath);
      if (summary) {
        parsedFiles.push(summary);
        languageSet.add(language);
      }
    }

    const chunks = chunkByLayer(parsedFiles);
    const astSummary = buildFullAstSummary(chunks);

    return {
      repoId: path.basename(repoPath),
      languages: Array.from(languageSet),
      fileCount: parsedFiles.length,
      parsedFiles,
      astSummary,
    };
  }

  private parseFile(
    filePath: string,
    content: string,
    language: string,
    repoRoot: string,
  ): FileParseSummary | null {
    const parser = this.parsers.get(language);
    if (!parser) return null;

    let tree: Parser.Tree;
    try {
      tree = parser.parse(content);
    } catch {
      return null;
    }

    const functions: string[] = [];
    const classes: string[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    this.walkNode(tree.rootNode, (node) => {
      switch (node.type) {
        case 'function_declaration':
        case 'function_definition':
        case 'method_definition':
        case 'method_declaration': {
          const nameNode = node.childForFieldName('name');
          if (nameNode) functions.push(nameNode.text);
          break;
        }
        case 'class_declaration':
        case 'class_definition': {
          const nameNode = node.childForFieldName('name');
          if (nameNode) classes.push(nameNode.text);
          break;
        }
        case 'import_declaration':
        case 'import_statement': {
          const source = node.childForFieldName('source') ?? node.lastChild;
          if (source) imports.push(source.text.replace(/['"]/g, ''));
          break;
        }
        case 'export_statement': {
          const decl = node.childForFieldName('declaration');
          if (decl) {
            const nameNode = decl.childForFieldName('name');
            if (nameNode) exports.push(nameNode.text);
          }
          break;
        }
      }
    });

    const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, '/');

    return {
      filePath: relativePath,
      language,
      functions,
      classes,
      imports,
      exports,
    };
  }

  private walkNode(node: Parser.SyntaxNode, visitor: (n: Parser.SyntaxNode) => void): void {
    visitor(node);
    for (const child of node.children) {
      this.walkNode(child, visitor);
    }
  }

}
