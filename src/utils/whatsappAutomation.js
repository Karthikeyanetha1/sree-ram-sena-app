import { formatWhatsAppDonationMessage } from './receiptGenerator';

export const defaultWhatsAppSettings = {
  autoLaunchOnReceipt: true,
  phoneNumberId: "1249745651554312",
  cloudApiToken: "EAAi0IqSBYcIBSDE1xHVdwxlGRJ4pAWIZBWDlr7CqvZBAoUEWuZAzdNEHUzSvhciNYUwdUoSdydbvnD64C2gZAqfcR31L1d950EX2f4mJ368kfihJ0opVHg6ITKVUDam0TF5ESubtCAlckZCWy8lVYbOcHt20gIlIf9vPGRK3m3GOJIdtaxRvq1NYhitfZAQZA3RSoZBRsmJXuHcFJrwPVvxZA62eIgw4CGLdpvWonj016fmzjsiyxkh52ZCQB45YKD63Hg9Ign1XLgpSpAmzlC5qve0wZDZD",
  provider: "meta"
};

export async function sendAutomatedWhatsAppReceipt(donation, committeeInfo, settings = defaultWhatsAppSettings) {
  const phone = donation.mobile ? donation.mobile.replace(/\D/g, '') : '';
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;

  const messageText = formatWhatsAppDonationMessage(donation, committeeInfo);

  const activeToken = settings.cloudApiToken || defaultWhatsAppSettings.cloudApiToken;
  const activePhoneId = settings.phoneNumberId || defaultWhatsAppSettings.phoneNumberId;

  const encodedText = encodeURIComponent(messageText);
  const waUrl = formattedPhone ? `https://wa.me/${formattedPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;

  // 1. Try Meta Cloud API v25.0 background dispatch
  if (activeToken && activePhoneId && formattedPhone) {
    try {
      const res = await fetch(`https://graph.facebook.com/v25.0/${activePhoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: { body: messageText }
        })
      });

      const data = await res.json();
      console.log("Meta Cloud API Live Dispatch Response:", data);

      if (data.messages && data.messages.length > 0) {
        return { success: true, method: "Meta Cloud API Direct", data, url: waUrl };
      }
    } catch (err) {
      console.warn("Meta Cloud API background attempt notice:", err.message);
    }
  }

  // 2. Auto-launch WhatsApp Web / App prefilled tab
  if (settings.autoLaunchOnReceipt) {
    window.open(waUrl, '_blank');
  }

  return { success: true, method: "Auto WhatsApp Tab Launch", url: waUrl };
}
