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

  // Replace await fetch('/news?...') with await api.get('/news?...')
  // Replace await fetch('/dashboard/summary', ...) with await api.get('/dashboard/summary')
  // We already fixed DashboardPage but wait, did we? DashboardPage is fixed.
  // But GstDashboardPage was broken. I'll restore it and fix it via regex.

  // Restore GstDashboardPage.tsx (I'll do this manually in the script for that specific file)
  if (filePath.endsWith('GstDashboardPage.tsx')) {
    // If it's missing the fetchGstNews, I need to restore it
    if (!content.includes('fetchGstNews')) {
      content = content.replace('  }, []);\n\n  if (loading) {', `    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchGstNews = async () => {
      try {
        const [res, cbicRes] = await Promise.all([
          api.get('/news?department=gst-council&limit=8'),
          api.get('/news?department=cbic&limit=8')
        ]);
        const combined = [...(res.data.data || []), ...(cbicRes.data.data || [])]
          .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 10);
        setGstNews(combined);
      } catch {} finally { setNewsLoading(false); }
    };
    fetchGstNews();
  }, []);

  if (loading) {`);
    }
  }

  // Now for the other files (LegalPage, IncomeTaxDashboardPage, ImportExportPage)
  // They have: const res = await fetch('/news?department=...&limit=...');
  //            const d = await res.json();
  //            if (d.success) set...(d.data || []);
  
  const regex = /const (\w+) = await fetch\('([^']+)'\);\n\s*const (\w+) = await \1\.json\(\);\n\s*if \(\3\.success\) (\w+)\(\3\.data \|\| \[\]\);/g;
  content = content.replace(regex, (match, resVar, url, dataVar, setFunc) => {
    return `const response = await api.get('${url}');\n        if (response.data.success) ${setFunc}(response.data.data || []);`;
  });

  // Now fix NewsPage.tsx
  if (filePath.endsWith('NewsPage.tsx')) {
    content = content.replace(/await fetch\(`\$\{API_BASE\}\/news\/bookmark\/\$\{item\.id\}`,\s*\{\s*method:\s*'DELETE',\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}\s*\}\)/g, "await api.delete(`/news/bookmark/${item.id}`)");
    content = content.replace(/await fetch\(`\$\{API_BASE\}\/news\/bookmark`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`,\s*'Content-Type':\s*'application\/json'\s*\}\s*,\s*body:\s*JSON\.stringify\(\{\s*newsId:\s*item\.id\s*\}\)\s*\}\)/g, "await api.post(`/news/bookmark`, { newsId: item.id })");
    content = content.replace(/await fetch\(`\$\{API_BASE\}\/news\/sync`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}\s*\}\)/g, "await api.post(`/news/sync`)");
    
    // Also replace fetch with api.get for NewsPage
    content = content.replace(/const res = await fetch\(`\$\{API_BASE\}\/news\/stats`\);\n\s*const data = await res\.json\(\);/g, "const response = await api.get(`/news/stats`);\n      const data = response.data;");
    content = content.replace(/const res = await fetch\(`\$\{API_BASE\}\/news\/bookmarks\/my`\);\n\s*const data = await res\.json\(\);/g, "const response = await api.get(`/news/bookmarks/my`);\n      const data = response.data;");
    content = content.replace(/const res = await fetch\(endpoint\);\n\s*const data = await res\.json\(\);/g, "const response = await api.get(endpoint.replace(API_BASE, ''));\n      const data = response.data;");
    
    // Also remove API_BASE references since we use api directly
    // Wait, let's just make sure the `api` is imported in NewsPage.tsx
    if (!content.includes('import { api }')) {
      content = "import { api } from '@/lib/api';\n" + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated fetch to api in ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src', 'pages'), processFile);
