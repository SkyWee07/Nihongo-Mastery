const https = require('https');

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJson(res.headers.location));
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const run = async () => {
  try {
    const data = await fetchJson('https://raw.githubusercontent.com/jamsinclair/open-jlpt-vocab/master/data/n5.json');
    console.log("N5 vocab from jamsinclair:", data.slice(0, 3));
  } catch (e) {
    console.error(e);
  }
};

run();
