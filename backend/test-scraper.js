const axios = require('axios');
const cheerio = require('cheerio');

async function scrape() {
  const newsItems = [];
  const axiosConfig = { 
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  };

  try {
    const cgstRes = await axios.get('https://www.gstcouncil.gov.in/central-gst', axiosConfig);
    const $cgst = cheerio.load(cgstRes.data);
    $cgst('.node__content a').each((i, el) => {
      const title = $cgst(el).text().trim();
      let link = $cgst(el).attr('href');
      if (title && link && title.length > 5) {
        if (link.startsWith('/')) link = 'https://www.gstcouncil.gov.in' + link;
        newsItems.push({ title, link });
      }
    });
    console.log(`CGST items found: ${newsItems.length}`);
  } catch (err) {
    console.error(`Error scraping Central GST: ${err.message}`);
  }
}
scrape();
