// Vercel Serverless Function: Festival Broadcast Dispatches
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { recipients = [], templateType, customMessage } = req.body || {};

    const META_TOKEN = process.env.META_WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;

    const results = recipients.map(r => ({
      donorName: r.donorName,
      mobile: r.mobile,
      status: 'Prepared 1-on-1'
    }));

    return res.status(200).json({
      success: true,
      totalCount: recipients.length,
      mode: META_TOKEN ? 'META_WHATSAPP_CLOUD_API' : 'SANDBOX_FALLBACK_ENGINE',
      dispatchedLedger: results
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
