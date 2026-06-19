const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'apps', 'mobile', 'eslint-errors.json');
if (!fs.existsSync(jsonPath)) {
  console.error('File not found:', jsonPath);
  process.exit(1);
}

const fileContent = fs.readFileSync(jsonPath, 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(fileContent);

let totalErrors = 0;
let totalWarnings = 0;

const summary = [];

data.forEach((file) => {
  if (file.messages.length > 0) {
    const relativePath = path.relative(path.join(__dirname, '..'), file.filePath);
    const errors = file.messages.filter(m => m.severity === 2);
    const warnings = file.messages.filter(m => m.severity === 1);
    
    totalErrors += errors.length;
    totalWarnings += warnings.length;
    
    if (errors.length > 0 || warnings.length > 0) {
      summary.push({
        file: relativePath,
        errors: errors.map(e => ({
          line: e.line,
          rule: e.ruleId,
          message: e.message
        })),
        warnings: warnings.map(w => ({
          line: w.line,
          rule: w.ruleId,
          message: w.message
        }))
      });
    }
  }
});

let output = `Total: ${totalErrors} errors, ${totalWarnings} warnings across ${summary.length} files.\n\n--- Details ---\n`;
summary.forEach((fileSummary) => {
  output += `\n📄 File: [${fileSummary.file}](file:///${path.resolve(fileSummary.file).replace(/\\/g, '/')})\n`;
  if (fileSummary.errors.length > 0) {
    output += '  Errors:\n';
    fileSummary.errors.forEach(e => {
      output += `    - L${e.line}: [${e.rule}] ${e.message}\n`;
    });
  }
  if (fileSummary.warnings.length > 0) {
    output += '  Warnings:\n';
    fileSummary.warnings.forEach(w => {
      output += `    - L${w.line}: [${w.rule}] ${w.message}\n`;
    });
  }
});

fs.writeFileSync(path.join(__dirname, 'eslint-summary.md'), output, 'utf8');
console.log('Summary written to scratch/eslint-summary.md');
