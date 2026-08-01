// Simulated AI OCR Scanner for Receipt Slips and Vendor Bills

export function scanReceiptSlip(imageFile) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return simulated extracted fields with high realism
      resolve({
        donorName: "Ramesh Kumar Goud",
        mobile: "9876543210",
        village: "Govindhupalli",
        address: "Ward No 4, Govindhupalli",
        amount: "1001",
        paymentMethod: "UPI",
        category: "Annadhanam",
        confidence: "96%",
        notes: "Extracted from OCR handwritten slip"
      });
    }, 1500);
  });
}

export function scanVendorBill(imageFile) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        vendor: "Sri Sai Tent House & Stage Decorators",
        category: "Decorations",
        amount: "18500",
        paymentMethod: "UPI",
        date: new Date().toISOString().split('T')[0],
        gstNo: "36ABCDE1234F1Z5",
        remarks: "Extracted from OCR invoice photo"
      });
    }, 1500);
  });
}
