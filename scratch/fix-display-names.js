const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'apps', 'mobile', 'eslint-errors.json');
if (!fs.existsSync(jsonPath)) {
  console.error('File not found:', jsonPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8').replace(/^\uFEFF/, ''));

data.forEach((file) => {
  const relativePath = path.relative(path.join(__dirname, '..'), file.filePath);
  const displayNameErrors = file.messages.filter(m => m.ruleId === 'react/display-name');
  
  if (displayNameErrors.length > 0) {
    console.log(`Fixing display-name in ${relativePath}...`);
    let content = fs.readFileSync(file.filePath, 'utf8');
    
    // Find exported memo or forwardRef components
    // Matches: export const ComponentName = React.memo(
    // or: export const ComponentName = memo(
    // or: export const ComponentName = React.forwardRef(
    const regex = /export\s+const\s+([A-Za-z0-9_]+)\s*=\s*(React\.)?(memo|forwardRef)\(/g;
    let match;
    const componentNames = [];
    
    while ((match = regex.exec(content)) !== null) {
      componentNames.push(match[1]);
    }
    
    if (componentNames.length === 0) {
      // Try local definitions (e.g. const Component = React.memo(...)
      const localRegex = /(?:const|let)\s+([A-Za-z0-9_]+)\s*=\s*(React\.)?(memo|forwardRef)\(/g;
      while ((match = localRegex.exec(content)) !== null) {
        componentNames.push(match[1]);
      }
    }
    
    if (componentNames.length > 0) {
      componentNames.forEach(name => {
        const displayNameString = `${name}.displayName = '${name}';`;
        if (!content.includes(`${name}.displayName`)) {
          // Find where to insert it. We want to insert it before const styles or before the end of the file.
          const stylesIndex = content.indexOf('const styles =');
          if (stylesIndex !== -1) {
            content = content.slice(0, stylesIndex) + displayNameString + '\n\n' + content.slice(stylesIndex);
            console.log(`  Inserted displayName for ${name} before styles.`);
          } else {
            content = content.trimEnd() + '\n\n' + displayNameString + '\n';
            console.log(`  Appended displayName for ${name} at the end of file.`);
          }
        } else {
          console.log(`  ${name}.displayName already exists!`);
        }
      });
      
      fs.writeFileSync(file.filePath, content, 'utf8');
    } else {
      console.warn(`  Could not find component name in ${relativePath}`);
    }
  }
});
