// Utility for 1-Click 100+ Bulk QA Seeding and Stress Testing

export function generate100BulkDonations() {
  const sampleNames = ['Roi Govindhupalli', 'Ramesh Sharma', 'Karthik Netha', 'Srinivas Rao', 'Venkat Reddy', 'Mahesh Kumar', 'Anil Varma', 'Prasad Goud', 'Vijay Kumar', 'Rajesh Patel'];
  const sampleVillages = ['Govindhupalli', 'Jagtial', 'Korutla', 'Metpally', 'Vemulawada'];
  const categories = ['General Donation', 'Annadhanam Sponsor', 'Pooja & Archana', 'Decoration & Flowers'];
  const paymentMethods = ['UPI', 'Cash', 'QR Code'];

  const bulkList = [];
  const yearPrefix = "SRS-26";

  for (let i = 1; i <= 100; i++) {
    const name = sampleNames[(i - 1) % sampleNames.length] + ` (${i})`;
    const village = sampleVillages[(i - 1) % sampleVillages.length];
    const amount = (Math.floor(Math.random() * 50) + 1) * 500; // ₹500 to ₹25,000
    const receiptNo = `${yearPrefix}-${String(i).padStart(6, '0')}`;
    const mobile = `988${String(7000000 + i).slice(0, 7)}`;

    bulkList.push({
      receiptNo,
      donorName: name,
      mobile,
      village,
      address: village,
      amount,
      amountInWords: `${amount} Rupees Only`,
      paymentMethod: paymentMethods[i % paymentMethods.length],
      category: categories[i % categories.length],
      collector: i % 2 === 0 ? 'Ravi Kumar' : 'Karthik Sharma',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      status: 'Verified',
      notes: 'QA Pass Test Seeding'
    });
  }

  return bulkList;
}
