// Vercel Serverless Function — Meta WhatsApp Cloud API Webhook Verification Endpoint
// Path: /api/webhook

module.exports = async (req, res) => {
  // 1. GET Method — Webhook Verification by Meta Dashboard
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'sreeramsena2026secret';

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("✓ Meta WhatsApp Webhook Verified Successfully!");
        return res.status(200).send(challenge);
      } else {
        console.warn("⚠️ Meta Webhook Token Mismatch!");
        return res.status(403).json({ error: "Verification token mismatch" });
      }
    }

    return res.status(400).json({ error: "Missing hub.mode or hub.verify_token" });
  }

  // 2. POST Method — Realtime Delivery Statuses & Incoming Messages
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log("📩 Incoming Meta WhatsApp Webhook Event:", JSON.stringify(body));

      // Acknowledge receipt to Meta with 200 OK
      return res.status(200).json({ status: "EVENT_RECEIVED" });
    } catch (err) {
      console.error("Webhook processing error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};
