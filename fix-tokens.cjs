const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(fullPath));
        } else { 
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src', 'pages'));
const targetStr = "localStorage.getItem('token')";

let updatedCount = 0;

files.forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(targetStr)) {
        console.log(`Fixing ${file}`);
        updatedCount++;
        
        // Replace all instances of `localStorage.getItem('token')` with `token`
        content = content.replace(/localStorage\.getItem\('token'\)/g, "token");
        
        // If it uses useAuth, we need to ensure the hook is imported and called
        if (!content.includes('const { token } = useAuth();')) {
            // Find the main component function declaration to inject `const { token } = useAuth();`
            // Usually looks like `export default function ComponentName() {` or `const ComponentName = () => {`
            content = content.replace(/(export default function \w+\([^)]*\)\s*\{|const \w+\s*=\s*\([^)]*\)\s*=>\s*\{)/, "$1\n  const { token } = useAuth();");
        }

        // Add the import if missing
        if (!content.includes("import { useAuth }")) {
            // Calculate relative path to AuthContext.tsx
            const depth = file.split(path.sep).length - path.join(__dirname, 'src', 'pages').split(path.sep).length;
            const prefix = depth === 0 ? '../' : '../'.repeat(depth + 1);
            const importPath = `${prefix}contexts/AuthContext`;
            content = `import { useAuth } from '${importPath}';\n` + content;
        }

        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log(`Finished fixing ${updatedCount} files.`);
