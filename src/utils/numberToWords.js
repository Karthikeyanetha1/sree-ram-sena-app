// Utility to convert numeric amounts to words in English and Telugu

export function numberToWords(amount, lang = 'en') {
  const num = parseInt(amount, 10);
  if (isNaN(num) || num <= 0) return lang === 'te' ? "సున్నా రూపాయలు మాత్రమే" : "Zero Rupees Only";

  if (lang === 'te') {
    return convertTelugu(num) + " రూపాయలు మాత్రమే";
  }

  return convertEnglish(num) + " Rupees Only";
}

function convertEnglish(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
  if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertEnglish(num % 100) : '');
  if (num < 100000) return convertEnglish(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertEnglish(num % 1000) : '');
  if (num < 10000000) return convertEnglish(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convertEnglish(num % 100000) : '');
  return convertEnglish(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convertEnglish(num % 10000000) : '');
}

function convertTelugu(num) {
  const ones = ['', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది'];
  const tens = ['', 'పది', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'దెబ్బై', 'ఎనిమిభై', 'తొంబై'];
  
  if (num === 0) return 'సున్నా';
  if (num < 10) return ones[num];
  if (num === 100) return 'వంద';
  if (num === 1000) return 'వెయ్యి';
  
  if (num < 100) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    return tens[t] + (o > 0 ? ' ' + ones[o] : '');
  }
  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rem = num % 100;
    return (h === 1 ? 'వంద' : ones[h] + ' వందల') + (rem > 0 ? ' ' + convertTelugu(rem) : '');
  }
  if (num < 100000) {
    const th = Math.floor(num / 1000);
    const rem = num % 1000;
    return (th === 1 ? 'వెయ్యి' : convertTelugu(th) + ' వేల') + (rem > 0 ? ' ' + convertTelugu(rem) : '');
  }
  
  const lakh = Math.floor(num / 100000);
  const rem = num % 100000;
  return (lakh === 1 ? 'ఒక లక్ష' : convertTelugu(lakh) + ' లక్షల') + (rem > 0 ? ' ' + convertTelugu(rem) : '');
}
