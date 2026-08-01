import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  Users, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck,
  FileText
} from 'lucide-react';

export const ReportsView = () => {
  const { t, donations, expenses, committeeInfo } = useApp();
  const [reportType, setReportType] = useState('summary'); // 'summary' | 'collector' | 'payment'

  // Dynamic Financial Calculations
  const totalDonations = donations.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const netBalance = totalDonations - totalExpenses;

  // Dynamic Payment Method Breakdown
  const paymentBreakdown = donations.reduce((acc, d) => {
    const mode = d.paymentMethod || 'UPI';
    acc[mode] = (acc[mode] || 0) + (parseFloat(d.amount) || 0);
    return acc;
  }, {});

  // Dynamic Collector Breakdown
  const collectorBreakdown = donations.reduce((acc, d) => {
    const collector = d.collector || 'Unassigned';
    if (!acc[collector]) {
      acc[collector] = { amount: 0, count: 0 };
    }
    acc[collector].amount += (parseFloat(d.amount) || 0);
    acc[collector].count += 1;
    return acc;
  }, {});

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Receipt No,Donor Name,Mobile,Village,Amount,Payment Method,Collector,Date\n";

    donations.forEach(d => {
      csvContent += `"${d.receiptNo}","${d.donorName}","${d.mobile}","${d.village}",${d.amount},"${d.paymentMethod}","${d.collector}","${d.date}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SREE_RAM_SENA_DONATIONS_REPORT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.financialReports}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Dynamic real-time collection reports and CSV/PDF export generator.
          </p>
        </div>

        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-900 text-white p-5 rounded-3xl shadow-md border border-emerald-800">
          <span className="text-[10px] font-extrabold uppercase text-emerald-300 tracking-widest block mb-1">
            Total Festival Collection
          </span>
          <h3 className="text-2xl font-black">₹{totalDonations.toLocaleString('en-IN')}</h3>
          <span className="text-xs text-emerald-200 mt-1 block font-semibold">
            {donations.length} Real Recorded Receipts
          </span>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest block mb-1">
            Total Approved Expenses
          </span>
          <h3 className="text-2xl font-black">₹{totalExpenses.toLocaleString('en-IN')}</h3>
          <span className="text-xs text-slate-300 mt-1 block font-semibold">
            {expenses.length} Vouchers Approved
          </span>
        </div>

        <div className="bg-emerald-50 text-emerald-950 p-5 rounded-3xl shadow-md border border-emerald-200">
          <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-widest block mb-1">
            Net Treasury Balance
          </span>
          <h3 className="text-2xl font-black">₹{netBalance.toLocaleString('en-IN')}</h3>
          <span className="text-xs text-emerald-700 mt-1 block font-extrabold">
            Available Fund for Festival
          </span>
        </div>
      </div>

      {/* REPORT SUB TABS */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 no-print">
        <button
          onClick={() => setReportType('summary')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            reportType === 'summary' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily & Payment Summary
        </button>

        <button
          onClick={() => setReportType('collector')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            reportType === 'collector' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Collector Performance Report
        </button>
      </div>

      {/* REPORT CONTENT: SUMMARY */}
      {reportType === 'summary' && (
        <div className="space-y-6">
          
          {/* Payment Method Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Collection by Payment Mode</h3>
            
            {Object.keys(paymentBreakdown).length === 0 ? (
              <p className="text-xs text-slate-500 italic">No donations recorded yet to generate payment mode statistics.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(paymentBreakdown).map(([mode, amt]) => (
                  <div key={mode} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">{mode}</span>
                    <h4 className="text-lg font-black text-emerald-950">₹{amt.toLocaleString('en-IN')}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real Transactions Ledger */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Verified Receipts Statement</h3>

            {donations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                No real donation receipts issued yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Receipt No</th>
                      <th className="py-2.5 px-3">Donor Name</th>
                      <th className="py-2.5 px-3">Village</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {donations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-500">{d.date}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-800">{d.receiptNo}</td>
                        <td className="py-2 px-3 font-extrabold text-slate-900">{d.donorName}</td>
                        <td className="py-2 px-3 text-slate-700">{d.village}</td>
                        <td className="py-2 px-3 font-black text-emerald-950">₹{d.amount.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-slate-600">{d.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* REPORT CONTENT: COLLECTORS */}
      {reportType === 'collector' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Collector Collection Ledger</h3>

          {Object.keys(collectorBreakdown).length === 0 ? (
            <p className="text-xs text-slate-500 italic">No collector entries recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(collectorBreakdown).map(([name, data]) => (
                <div key={name} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{name}</h4>
                    <span className="text-xs text-slate-500">{data.count} Receipts Issued</span>
                  </div>
                  <span className="text-base font-black text-emerald-900">
                    ₹{data.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
