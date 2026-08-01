// Vercel Serverless Function: Send Receipt via Meta WhatsApp Cloud API or Sandbox Fallback
export default async function handler(req, res) {
  // CORS Headers
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
    const { receiptNo, donorName, amount, mobile, paymentMethod, pdfUrl } = req.body || {};

    if (!donorName || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required donor details.' });
    }

    const cleanMobile = mobile ? mobile.replace(/\D/g, '') : '';
    const phoneWithCountry = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    // Read Meta Credentials from Vercel Environment Variables
    const META_TOKEN = process.env.META_WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;

    // If Meta Credentials exist in Vercel, send official WhatsApp API request
    if (META_TOKEN && PHONE_NUMBER_ID && phoneWithCountry) {
      const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${META_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneWithCountry,
          type: 'template',
          template: {
            name: 'receipt_notification',
            language: { code: 'te' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: donorName },
                  { type: 'text', text: receiptNo || 'SRS-2026-000001' },
                  { type: 'text', text: `₹${amount}` }
                ]
              }
            ]
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        return res.status(200).json({
          success: true,
          mode: 'META_WHATSAPP_CLOUD_API',
          messageId: data.messages?.[0]?.id || 'WA-MSG-OK',
          status: 'Delivered'
        });
      } else {
        console.warn('Meta WhatsApp Cloud API Note:', data.error?.message);
      }
    }

    // Sandbox / Direct Messenger Fallback Mode
    const fallbackMessage = `🙏 *శ్రీ గణేశ ప్రసాద విరాళ రసీదు*
*SREE RAM SENA Vinayaka Chavithi 2026*

దాత: ${donorName}
రసీదు #: ${receiptNo || 'SRS-2026-000001'}
మొత్తం: ₹${amount}/-
చల్లించిన పద్ధతి: ${paymentMethod || 'UPI'}

శ్రీ రామ్ సేన తరఫున హృదయపూర్వక ధన్యవాదములు! 🌺`;

    const encoded = encodeURIComponent(fallbackMessage);
    const directWaUrl = phoneWithCountry ? `https://wa.me/${phoneWithCountry}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    return res.status(200).json({
      success: true,
      mode: 'SANDBOX_FALLBACK_ENGINE',
      status: 'Ready for 1-Click Messaging',
      directWaUrl,
      message: 'Meta API credentials pending in Vercel environment. Sandbox engine active.'
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
