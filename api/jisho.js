export default async function handler(req, res) {
  const { keyword } = req.query;
  
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    const jishoResponse = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`);
    
    if (!jishoResponse.ok) {
      throw new Error(`Jisho API responded with status: ${jishoResponse.status}`);
    }

    const data = await jishoResponse.json();
    
    // Allow CORS for the frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Jisho:', error);
    res.status(500).json({ error: 'Failed to fetch from Jisho API' });
  }
}
