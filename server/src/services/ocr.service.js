const https = require('https');
const http = require('http');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'openai/gpt-4o-mini';

const EXTRACTION_PROMPT = "You are an expert lab report data extractor for FSSAI honey quality testing reports. Analyze the uploaded lab report image and extract the following parameters. Return ONLY a valid JSON object with these exact keys. If a value cannot be found, use null. {\"labName\": \"string\", \"reportNumber\": \"string\", \"reducingSugar\": \"number\", \"sucrose\": \"number\", \"moisture\": \"number\", \"ash\": \"number\", \"fiehesTest\": \"string - Negative or Positive\", \"hmf\": \"number\", \"fgRatio\": \"number\", \"specificGravity\": \"number\", \"acidity\": \"number\", \"proline\": \"number\", \"remarks\": \"string\"}. IMPORTANT: Return ONLY the JSON object, no markdown, no code fences.";

async function extractLabReport(base64Image) {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not configured');
  let imageUrl = base64Image;
  if (!imageUrl.startsWith('data:')) imageUrl = 'data:image/jpeg;base64,' + imageUrl;
  
  const requestBody = JSON.stringify({
    model: MODEL,
    messages: [{ role: 'user', content: [{ type: 'text', text: EXTRACTION_PROMPT }, { type: 'image_url', image_url: { url: imageUrl } }] }],
    max_tokens: 1024, temperature: 0.1
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'openrouter.ai', path: '/api/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENROUTER_API_KEY }
    }, (res) => {
      let data = ''; res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) { reject(new Error(response.error.message || 'API error')); return; }
          let content = response.choices?.[0]?.message?.content;
          if (!content) { reject(new Error('No response from AI model')); return; }
          content = content.trim();
          if (content.startsWith('```')) { content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, ''); }
          resolve(JSON.parse(content));
        } catch (err) { reject(new Error('Failed to parse AI extraction response')); }
      });
    });
    req.on('error', reject); req.write(requestBody); req.end();
  });
}
module.exports = { extractLabReport };
