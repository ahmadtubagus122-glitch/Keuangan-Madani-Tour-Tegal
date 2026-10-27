import React, { useState, useEffect } from 'react';
import { X, Check, PlusCircle, MinusCircle, User, Phone, FileText, Calendar, Wallet } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, UmrohPackage } from '../types';
import { CATEGORIES_IN, CATEGORIES_OUT } from '../data/initialData';
import { formatRupiah, terbilang, generateReceiptNumber } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  packages: UmrohPackage[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'in',
  editingTransaction = null,
  packages,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer_bsi');
  const [packageId, setPackageId] = useState<string>('');
  const [jamaahName, setJamaahName] = useState('');
  const [jamaahPhone, setJamaahPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [handledBy, setHandledBy] = useState('Admin Kasir Madani');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset or populate fields on modal open
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setReceiptNumber(editingTransaction.receiptNumber);
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category);
      setAmount(editingTransaction.amount);
      setAmountInput(editingTransaction.amount.toString());
      setPaymentMethod(editingTransaction.paymentMethod);
      setPackageId(editingTransaction.packageId || '');
      setJamaahName(editingTransaction.jamaahName || '');
      setJamaahPhone(editingTransaction.jamaahPhone || '');
      setNotes(editingTransaction.notes || '');
      setHandledBy(editingTransaction.handledBy || 'Titis Mularsih');
    } else {
      const activeType: TransactionType = initialType === 'out' ? 'out' : 'in';
      setType(activeType);
      setReceiptNumber(generateReceiptNumber(activeType));
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(activeType === 'in' ? CATEGORIES_IN[0].id : CATEGORIES_OUT[0].id);
      setAmount(0);
      setAmountInput('');
      setPaymentMethod('transfer_bca');
      setPackageId(packages.length > 0 ? packages[0].id : '');
      setJamaahName('');
      setJamaahPhone('');
      setNotes('');
      setHandledBy('Titis Mularsih');
    }
    setErrorMsg('');
  }, [isOpen, editingTransaction, initialType, packages]);

  // When type changes on create, update receipt prefix & default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (!editingTransaction) {
      setReceiptNumber(generateReceiptNumber(newType));
      setCategory(newType === 'in' ? CATEGORIES_IN[0].id : CATEGORIES_OUT[0].id);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(rawVal, 10) || 0;
    setAmount(num);
    setAmountInput(rawVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMsg('Nominal uang harus lebih besar dari 0 Rupiah.');
      return;
    }
    if (!category) {
      setErrorMsg('Silakan pilih kategori transaksi.');
      return;
    }

    const selectedPkg = packages.find((p) => p.id === packageId);

    const newTx: Transaction = {
      id: editingTransaction ? editingTransaction.id : `tx-${Date.now()}`,
      receiptNumber: receiptNumber || generateReceiptNumber(type),
      date,
      type,
      category,
      amount,
      paymentMethod,
      packageId: packageId || undefined,
      packageName: selectedPkg ? selectedPkg.name : undefined,
      jamaahName: type === 'in' ? jamaahName.trim() : undefined,
      jamaahPhone: type === 'in' && jamaahPhone ? jamaahPhone.trim() : undefined,
      notes: notes.trim(),
      handledBy: handledBy.trim() || 'Admin Kasir Madani',
      status: 'verified',
      createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString(),
    };

    onSave(newTx);
    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'in' ? CATEGORIES_IN : CATEGORIES_OUT;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          type === 'in' ? 'bg-gradient-to-r from-emerald-800 to-teal-800' : 'bg-gradient-to-r from-rose-800 to-red-800'
        }`}>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
              Madani Tour Tegal • Pembukuan Keuangan
            </span>
            <h2 className="text-lg font-bold">
              {editingTransaction ? 'Edit Data Transaksi' : type === 'in' ? 'Catat Pemasukan (Kas Masuk)' : 'Catat Pengeluaran (Kas Keluar)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Tab In / Out Switch (only if not editing) */}
          {!editingTransaction && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('in')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'in'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Pemasukan (DP, Pelunasan, Paspor, dll)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('out')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'out'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5" />
                Pengeluaran (Tiket, Hotel, Visa, Ops)
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Receipt Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Bukti / Kwitansi
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="KWT-MDT/..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Transaksi
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          {/* Amount Field with Real-Time Terbilang */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nominal Transaksi (Rupiah) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-bold text-slate-500">Rp</span>
              <input
                type="text"
                value={amountInput ? parseInt(amountInput, 10).toLocaleString('id-ID') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-11 pr-3 py-2 text-lg font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                autoFocus
                required
              />
            </div>

            {/* Terbilang helper for receipts */}
            <div className="mt-2 text-xs text-emerald-800 bg-emerald-50/80 p-2 rounded border border-emerald-200">
              <span className="font-bold text-emerald-900">Terbilang: </span>
              <span className="italic font-medium">{amount > 0 ? terbilang(amount) : 'Nol Rupiah'}</span>
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Transaksi *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              >
                {currentCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rekening / Metode Pembayaran *
              </label>
              <div className="relative">
                <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                >
                  <option value="transfer_bca">BCA (Rek: 3620718946)</option>
                  <option value="transfer_mandiri">Bank Mandiri (Rek: 1390016430740)</option>
                  <option value="transfer_bri">Bank BRI Kantor Tegal</option>
                  <option value="cash">Kas Tunai di Kantor Tegal</option>
                  <option value="qris">QRIS Madani Tour Tegal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Umroh Package Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alokasi Paket Umroh Terkait (Opsional)
            </label>
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">-- Biaya Umum / Operasional Kantor Non-Paket --</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({formatRupiah(pkg.pricePerPax)}/pax)
                </option>
              ))}
            </select>
          </div>

          {/* Jamaah Information (Important for Pemasukan / DP / Pelunasan) */}
          {type === 'in' && (
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                Data Jamaah / Pembayar
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Lengkap Jamaah (Opsional)
                  </label>
                  <input
                    type="text"
                    value={jamaahName}
                    onChange={(e) => setJamaahName(e.target.value)}
                    placeholder="Contoh: H. Ahmad Subekti (opsional)"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    No. WhatsApp / Telepon
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={jamaahPhone}
                      onChange={(e) => setJamaahPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes & Staff in Charge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Keterangan Tambahan / Rincian
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pembayaran DP 2 Pax, Upgrade Kamar Double, Booking Seat Saudia..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Petugas / Kasir
              </label>
              <input
                type="text"
                value={handledBy}
                onChange={(e) => setHandledBy(e.target.value)}
                placeholder="Titis Mularsih"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                type === 'in'
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
