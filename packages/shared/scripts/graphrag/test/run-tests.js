import { scanDirectory, parseFile } from '../parser.js';
import { resolveImport } from '../resolver.js';
import { Query } from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, 'fixtures');
const files = scanDirectory(fixturesDir);

// 1. Test scanning
console.log("Found files:", files.map(f => path.basename(f)));
if (files.length !== 2) {
  console.error(`❌ Test Failed: expected 2 files, found ${files.length}`);
  process.exit(1);
}
console.log("✅ Scan Directory passed.");

// 2. Test path resolution
const storeFile = files.find(f => f.endsWith('store.ts'));
const utilsFile = files.find(f => f.endsWith('utils.ts'));

console.log(`Testing resolver for: ${path.basename(storeFile)} importing './utils'`);
const resolved = resolveImport(storeFile, './utils');
console.log("Resolved path:", resolved);

if (resolved !== utilsFile) {
  console.error(`❌ Test Failed: expected resolver to find ${utilsFile}, but got ${resolved}`);
  process.exit(1);
}
console.log("✅ Resolve Import passed.");

// 3. Test AST Queries for Export and Import
const exportQuery = new Query(TypeScript.tsx, `
  (export_statement
    declaration: (lexical_declaration
      (variable_declarator
        name: (identifier) @export_name)))
`);

const tree = parseFile(utilsFile);
const matches = exportQuery.matches(tree.rootNode);
console.log(`Found ${matches.length} exports in utils.ts`);

let foundAdd = false;
for (const match of matches) {
  for (const capture of match.captures) {
    if (capture.name === 'export_name' && capture.node.text === 'add') {
      foundAdd = true;
    }
  }
}

if (!foundAdd) {
  console.error("❌ Test Failed: expected to find export 'add' in utils.ts");
  process.exit(1);
}
console.log("✅ AST Query Export passed.");

console.log("🎉 All GraphRAG Core Tests Passed successfully!");
