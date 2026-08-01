// Voice Assistant NLP Entity Extractor & Web Speech API integration

export function parseVoiceInput(transcript) {
  const text = transcript.trim();
  const lower = text.toLowerCase();

  const result = {
    rawText: text,
    intent: 'donation', // default
    donorName: '',
    mobile: '',
    village: 'Govindhupalli',
    amount: '',
    paymentMethod: 'UPI',
    category: 'General Donation',
    vendor: '',
    expenseCategory: 'Decorations',
    command: '',
    confidence: 'High'
  };

  // 1. Navigation / Voice Commands Check
  if (lower.includes('dashboard') || lower.includes('డాష్‌బోర్డ్')) {
    result.intent = 'command';
    result.command = 'NAV_DASHBOARD';
    return result;
  }
  if (lower.includes('expense') || lower.includes('ఖర్చు') || lower.includes('vendor')) {
    result.intent = 'expense';
  }
  if (lower.includes('report') || lower.includes('నివేదిక')) {
    result.intent = 'command';
    result.command = 'NAV_REPORTS';
    return result;
  }
  if (lower.includes('backup') || lower.includes('బ్యాకప్')) {
    result.intent = 'command';
    result.command = 'BACKUP';
    return result;
  }

  // 2. Extract Phone Number (10 digits)
  const phoneMatch = text.match(/\b[6-9]\d{9}\b/);
  if (phoneMatch) {
    result.mobile = phoneMatch[0];
  }

  // 3. Extract Amount
  const amountMatch = text.match(/(\d+)\s*(rupees|rs|రూపాయలు|రూ)?/i);
  if (amountMatch) {
    result.amount = amountMatch[1];
  } else {
    // Word amounts fallback
    if (lower.includes('thousand') || lower.includes('వెయ్యి')) result.amount = '1000';
    else if (lower.includes('five hundred') || lower.includes('ఐదు వందలు')) result.amount = '500';
    else if (lower.includes('one hundred') || lower.includes('వంద')) result.amount = '100';
  }

  // 4. Payment Method
  if (lower.includes('cash') || lower.includes('నగదు')) result.paymentMethod = 'Cash';
  else if (lower.includes('qr') || lower.includes('క్యూఆర్')) result.paymentMethod = 'QR Code';
  else if (lower.includes('card') || lower.includes('కార్డ్')) result.paymentMethod = 'Card';
  else result.paymentMethod = 'UPI';

  // 5. Donor Name extraction heuristics
  if (result.intent === 'donation') {
    const nameMatch = text.match(/(?:donor|datha|name|from|దాత|పేరు)\s+([A-Za-zఅ-హ\s]{3,20})/i);
    if (nameMatch) {
      result.donorName = nameMatch[1].replace(/(mobile|village|amount|rupees|upi|cash|500|1001|9876543210)/gi, '').trim();
    } else {
      // Fallback split
      const words = text.split(' ');
      if (words.length >= 2) {
        result.donorName = words.slice(0, 2).join(' ');
      }
    }
  }

  // 6. Expense parsing heuristics
  if (result.intent === 'expense') {
    const vendorMatch = text.match(/(?:vendor|tent house|lightings|sound|పూజ|వ్యాపారి)\s+([A-Za-zఅ-హ\s]{3,20})/i);
    if (vendorMatch) {
      result.vendor = vendorMatch[1].trim();
    } else {
      result.vendor = "Sai Tent House & Decorators";
    }

    if (lower.includes('tent') || lower.includes('decoration') || lower.includes('అలంకరణ')) {
      result.expenseCategory = "Decorations";
    } else if (lower.includes('pooja') || lower.includes('పూజ')) {
      result.expenseCategory = "Pooja Items";
    } else if (lower.includes('sound') || lower.includes('light')) {
      result.expenseCategory = "Sound & Stage";
    } else {
      result.expenseCategory = "Annadhanam Expenses";
    }
  }

  // 7. Village extraction
  if (lower.includes('govindhupalli') || lower.includes('గోవిందుపల్లి')) result.village = 'Govindhupalli';
  else if (lower.includes('jagtial') || lower.includes('జగిత్యాల')) result.village = 'Jagtial';
  else if (lower.includes('korutla') || lower.includes('కోరుట్ల')) result.village = 'Korutla';

  return result;
}

// Text-to-Speech feedback helper
export function speakText(text, lang = 'en-IN') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}
