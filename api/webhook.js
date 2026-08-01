// Vercel Serverless Function — Meta WhatsApp Cloud API Webhook Verification Endpoint
// Path: /api/webhook

module.exports = async (req, res) => {
  try {
    // Safe URL & Query parsing for Vercel Node.js Serverless Runtime
    const host = req.headers ? (req.headers.host || 'sree-ram-sena-app.vercel.app') : 'sree-ram-sena-app.vercel.app';
    const parsedUrl = new URL(req.url || '/api/webhook', `https://${host}`);
    
    const mode = parsedUrl.searchParams.get('hub.mode') || (req.query && req.query['hub.mode']);
    const token = parsedUrl.searchParams.get('hub.verify_token') || (req.query && req.query['hub.verify_token']);
    const challenge = parsedUrl.searchParams.get('hub.challenge') || (req.query && req.query['hub.challenge']);

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'sreeramsena2026secret';

    // 1. GET Method — Webhook Verification by Meta Dashboard
    if (req.method === 'GET') {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("✓ Meta WhatsApp Webhook Verified Successfully!");
        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).send(challenge || '');
      }

      if (token && token !== VERIFY_TOKEN) {
        console.warn("⚠️ Meta Webhook Token Mismatch!");
        return res.status(403).send('Forbidden: Token Mismatch');
      }

      return res.status(200).send('SREE RAM SENA Meta WhatsApp Webhook Endpoint Ready');
    }

    // 2. POST Method — Realtime Delivery Statuses & Incoming Messages
    if (req.method === 'POST') {
      console.log("📩 Incoming Meta WhatsApp Webhook Event");
      return res.status(200).json({ status: "EVENT_RECEIVED" });
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    // Always return 200 to prevent serverless function crash
    return res.status(200).send("OK");
  }
};
