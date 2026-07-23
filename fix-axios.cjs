const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace import axios from 'axios' with import { api } from '@/lib/api' if not exists
  if (content.includes("import axios from 'axios'") || content.includes('import axios from "axios"')) {
    content = content.replace(/import axios from ['"]axios['"];?\n?/, '');
    
    // Add api import if it's missing
    if (!content.includes('import { api }')) {
       // Just insert it near the top
       content = "import { api } from '../../lib/api';\n" + content;
    }
  }

  // Regex to replace axios.get('http://localhost:4000/api/v1/...') or axios.get('/api/v1/...')
  // with api.get('/...')
  // It handles the headers config object being passed to axios
  
  // A somewhat naive but effective approach for these specific patterns:
  // Replace `axios.get('url', { headers: { ... } })` with `api.get('url')`
  // We can just replace `axios.` with `api.` first.
  content = content.replace(/axios\.get/g, 'api.get');
  content = content.replace(/axios\.post/g, 'api.post');
  content = content.replace(/axios\.put/g, 'api.put');
  content = content.replace(/axios\.delete/g, 'api.delete');
  content = content.replace(/axios\.patch/g, 'api.patch');

  // Now, fix the URLs:
  content = content.replace(/http:\/\/localhost:4000\/api\/v1/g, '');
  content = content.replace(/\/api\/v1\//g, '/');
  
  // Now we need to remove the headers: { Authorization: ... } from the config
  // This is tricky with regex, but we can try to strip: `, {\n\s*headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }\n\s*}`
  // Let's just do a generic replace for that exact block
  const headerBlock1 = `, {
          headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` }
        }`;
  const headerBlock2 = `, {
        headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` }
      }`;
  const headerBlock3 = `, { headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` } }`;
  const headerBlock4 = `, {
          headers: { Authorization: \`Bearer \${token}\` }
        }`;
        
  // Also we need to remove `const token = localStorage.getItem('token');`
  content = content.replace(/const token = localStorage\.getItem\('token'\);\n?\s*/g, '');

  content = content.replace(headerBlock1, '');
  content = content.replace(headerBlock2, '');
  content = content.replace(headerBlock3, '');
  content = content.replace(headerBlock4, '');
  
  // Fix some lingering ones that might use different spacing
  content = content.replace(/, {\s*headers: {\s*Authorization: `Bearer \${[^}]+}`\s*}\s*}/g, '');

  if (content !== original) {
    // Let's fix up the import path for api depending on nesting depth
    if (content.startsWith("import { api } from '../../lib/api';")) {
       const depth = filePath.split(path.sep).length - filePath.split('src')[0].split(path.sep).length - 2;
       let prefix = '';
       for(let i=0; i<depth; i++) prefix += '../';
       if(prefix === '') prefix = './';
       content = content.replace("import { api } from '../../lib/api';", `import { api } from '${prefix}lib/api';`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src', 'pages'), processFile);
