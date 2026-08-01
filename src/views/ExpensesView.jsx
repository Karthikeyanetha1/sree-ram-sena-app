import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Receipt, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileCheck, 
  Paperclip, 
  X,
  Building,
  Calendar,
  IndianRupee,
  Eye
} from 'lucide-react';

export const ExpensesView = ({ openExpenseModal, setOpenExpenseModal }) => {
  const { t, expenses, addExpense, updateExpenseStatus, role } = useApp();
  
  const [formData, setFormData] = useState({
    vendor: '',
    category: 'Decorations',
    amount: '',
    paymentMethod: 'UPI',
    notes: ''
  });

  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vendor || !formData.amount) {
      alert("Please enter Vendor Name and Amount");
      return;
    }

    addExpense(formData);
    setOpenExpenseModal(false);
    setFormData({
      vendor: '',
      category: 'Decorations',
      amount: '',
      paymentMethod: 'UPI',
      notes: ''
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.expenseTitle}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track vendor payments, bill approvals, and financial vouchers.
          </p>
        </div>

        <button
          onClick={() => setOpenExpenseModal(true)}
          className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* EXPENSES LEDGER TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Voucher No</th>
                <th className="py-3.5 px-4">{t.expenseVendor}</th>
                <th className="py-3.5 px-4">{t.expenseCategory}</th>
                <th className="py-3.5 px-4">{t.approvalStatus}</th>
                <th className="py-3.5 px-4 text-right">{t.expenseAmount}</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition">
                  
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {exp.voucherNo}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900">{exp.vendor}</div>
                    <div className="text-[10px] text-slate-400">{exp.date} • {exp.paymentMethod}</div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {exp.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      exp.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : exp.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {exp.status === 'Approved' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                      {exp.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                      <span>{exp.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                    ₹{parseFloat(exp.amount).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setSelectedVoucher(exp)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="View Voucher"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Approval Toggle for Super Admin */}
                      {role === 'Super Admin' && exp.status === 'Pending' && (
                        <button
                          onClick={() => updateExpenseStatus(exp.id, 'Approved')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW EXPENSE MODAL */}
      {openExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
            
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">{t.addExpense}</h3>
              </div>
              <button 
                onClick={() => setOpenExpenseModal(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.expenseVendor} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="e.g. Sri Sai Tent House"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.expenseCategory}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-500 outline-none"
                  >
                    <option value="Decorations">Decorations & Pandal</option>
                    <option value="Sound & Stage">Sound & Stage</option>
                    <option value="Annadhanam Expenses">Annadhanam Expenses</option>
                    <option value="Pooja Items">Pooja Items</option>
                    <option value="Cultural Programs">Cultural Programs</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.expenseAmount} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Amount in ₹"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.paymentMethod}
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-emerald-500 outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.attachBill}
                  </label>
                  <div className="flex items-center justify-center p-2 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-xs cursor-pointer hover:bg-slate-100">
                    <Paperclip className="w-4 h-4 mr-1 text-slate-400" />
                    <span>Upload Proof</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Details of expense..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setOpenExpenseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-extrabold shadow-md transition"
                >
                  {t.saveExpense}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* VOUCHER DETAIL MODAL */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Official Expense Voucher
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{selectedVoucher.voucherNo}</h3>
              <p className="text-xs text-slate-500">{selectedVoucher.date}</p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span className="font-extrabold text-slate-900">{selectedVoucher.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-800">{selectedVoucher.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-black text-emerald-800 text-base">₹{selectedVoucher.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approval Status:</span>
                <span className="font-bold text-emerald-700">{selectedVoucher.status}</span>
              </div>
              {selectedVoucher.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 italic">
                  "{selectedVoucher.notes}"
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 text-center">
              <button
                onClick={() => window.print()}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs"
              >
                Print Expense Voucher
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
