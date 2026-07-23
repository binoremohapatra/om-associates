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

const files = walk(path.join(__dirname, 'src', 'pages', 'dashboard'));

let updatedCount = 0;

files.forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes("localStorage.getItem('token')")) {
        console.log(`Fixing ${file}`);
        updatedCount++;
        
        // Remove `const token = localStorage.getItem('token');`
        content = content.replace(/\s*const\s+token\s*=\s*localStorage\.getItem\('token'\);\s*/g, "\n");
        content = content.replace(/\s*let\s+token\s*=\s*localStorage\.getItem\('token'\);\s*/g, "\n");

        // Replace inline `localStorage.getItem('token')`
        content = content.replace(/localStorage\.getItem\('token'\)/g, "token");
        
        if (!content.includes('const { token } = useAuth();')) {
            content = content.replace(/(export default function \w+\([^)]*\)\s*\{|const \w+\s*=\s*\([^)]*\)\s*=>\s*\{)/, "$1\n  const { token } = useAuth();");
        }

        if (!content.includes("import { useAuth }")) {
            const fileDir = path.dirname(file);
            const relativeToContexts = path.relative(fileDir, path.join(__dirname, 'src', 'contexts'));
            const importPath = relativeToContexts.replace(/\\/g, '/') + '/AuthContext';
            content = `import { useAuth } from '${importPath}';\n` + content;
        }

        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log(`Finished fixing ${updatedCount} files.`);
