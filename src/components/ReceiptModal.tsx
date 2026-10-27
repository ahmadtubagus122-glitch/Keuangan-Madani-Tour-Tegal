import React, { useState } from 'react';
import { Printer, X, ShieldCheck, Download, Mail } from 'lucide-react';
import { Transaction } from '../types';
import { AGENCY_PROFILE } from '../data/initialData';
import { formatRupiah, terbilang, formatDateFull, getPaymentMethodLabel } from '../utils/formatters';
import { SendReceiptEmailModal } from './SendReceiptEmailModal';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEmailSent?: (msg: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ 
  transaction, 
  onClose,
  onEmailSent
}) => {
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCashIn = transaction.type === 'in';
  const methodInfo = getPaymentMethodLabel(transaction.paymentMethod);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-300">
        {/* Action Header (Hidden during Print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-amber-400">
              {isCashIn ? 'Kwitansi Tanda Terima Resmi' : 'Bukti Pengeluaran Kas Resmi'}
            </span>
            <span className="text-xs text-slate-400">({transaction.receiptNumber})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSendEmailOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>Kirim via Gmail</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Cetak PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Formal Document / Kwitansi (Visible on Screen & Print) */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 printable-receipt">
          {/* Header Kop Surat */}
          <div className="border-b-2 border-emerald-900 pb-4 mb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-20 shrink-0 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <img 
                    src={AGENCY_PROFILE.logoUrl} 
                    alt="Logo Madani Tour" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                      MADANI TOUR TEGAL
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                      Biro Umroh & Haji
                    </span>
                  </div>
                  <h2 className="text-xs font-bold text-slate-700 mt-0.5">
                    {AGENCY_PROFILE.name}
                  </h2>
                <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                  <span>{AGENCY_PROFILE.permit}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {AGENCY_PROFILE.officeAddress}
                </p>
                <p className="text-[11px] text-slate-500">
                  WhatsApp: {AGENCY_PROFILE.phone} • Email: {AGENCY_PROFILE.email}
                </p>
              </div>
            </div>

              {/* Document Title & No Box */}
              <div className="text-right">
                <div className="inline-block bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-center min-w-[180px]">
                  <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wide">
                    {isCashIn ? 'KWITANSI PEMBAYARAN' : 'BUKTI KAS KELUAR'}
                  </h3>
                  <div className="mt-1 text-xs font-mono font-bold text-emerald-800">
                    No: {transaction.receiptNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Tanggal: {formatDateFull(transaction.date)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body of Kwitansi */}
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Row 1: Telah Diterima Dari / Penerima */}
            <div className="grid grid-cols-12 gap-2 items-baseline py-1.5 border-b border-slate-100">
              <div className="col-span-3 sm:col-span-3 font-bold text-slate-700">
                {isCashIn ? 'Telah Diterima Dari' : 'Dibayarkan Kepada'}
              </div>
              <div className="col-span-9 sm:col-span-9 font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-slate-400">:</span>
                <span className="text-base font-extrabold text-emerald-950">
                  {transaction.jamaahName || (isCashIn ? 'Hamba Allah' : transaction.notes || 'Pihak Terkait')}
                </span>
                {transaction.jamaahPhone && (
                  <span className="text-xs text-slate-500 font-normal">
                    (Telp/WA: {transaction.jamaahPhone})
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Uang Sejumlah (Terbilang) */}
            <div className="grid grid-cols-12 gap-2 items-start py-2 border-b border-slate-100 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-200">
              <div className="col-span-3 sm:col-span-3 font-bold text-slate-700">
                Uang Sejumlah
              </div>
              <div className="col-span-9 sm:col-span-9 flex items-start gap-2">
                <span className="text-slate-400">:</span>
                <span className="font-bold text-emerald-900 italic leading-relaxed">
                  # {terbilang(transaction.amount)} #
                </span>
              </div>
            </div>

            {/* Row 3: Untuk Pembayaran */}
            <div className="grid grid-cols-12 gap-2 items-baseline py-1.5 border-b border-slate-100">
              <div className="col-span-3 sm:col-span-3 font-bold text-slate-700">
                Untuk Pembayaran
              </div>
              <div className="col-span-9 sm:col-span-9 font-medium text-slate-900 flex items-start gap-2">
                <span className="text-slate-400">:</span>
                <div>
                  <div className="font-bold text-slate-900">
                    {transaction.packageName || 'Biaya Operasional Umum'}
                  </div>
                  {transaction.notes && (
                    <div className="text-slate-600 text-xs mt-0.5">
                      {transaction.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 4: Metode Pembayaran */}
            <div className="grid grid-cols-12 gap-2 items-baseline py-1.5 border-b border-slate-100">
              <div className="col-span-3 sm:col-span-3 font-bold text-slate-700">
                Metode Pembayaran
              </div>
              <div className="col-span-9 sm:col-span-9 font-medium text-slate-800 flex items-center gap-2">
                <span className="text-slate-400">:</span>
                <span className="font-semibold">{methodInfo.label}</span>
              </div>
            </div>

            {/* Amount Banner */}
            <div className="mt-4 pt-2 flex items-center justify-between">
              <div className="inline-flex items-center px-5 py-3 rounded-xl bg-slate-100 border border-slate-300">
                <span className="text-xs font-bold text-slate-600 mr-2 uppercase">Jumlah:</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
                  {formatRupiah(transaction.amount)}
                </span>
              </div>

              <div className="text-right text-xs text-slate-500">
                <span>Tegal, {formatDateFull(transaction.date)}</span>
              </div>
            </div>

            {/* Signatures Section */}
            <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-16">
                <p className="font-semibold text-slate-700">
                  {isCashIn ? 'Penyetor / Jamaah,' : 'Penerima Kas,'}
                </p>
                <div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[160px]">
                    {transaction.jamaahName || '( ................................... )'}
                  </p>
                </div>
              </div>

              <div className="space-y-16">
                <p className="font-semibold text-slate-700">
                  Madani Tour Tegal,
                </p>
                <div className="relative inline-block min-w-[160px]">
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">
                    {transaction.handledBy || 'Titis Mularsih'}
                  </p>
                  <p className="text-[10px] text-slate-500">Bagian Keuangan Madani</p>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 flex items-center justify-between">
              <span>* Bukti sah pembayaran resmi PT MADANI PRABU JAYA (MADANI TOUR TEGAL). Harap disimpan untuk verifikasi pelunasan dan manasik.</span>
              <span className="font-mono text-[9px]">{transaction.id}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions for Mobile */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Kwitansi dapat dicetak ke printer, disimpan PDF, atau dikirim langsung via Gmail ke jamaah.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSendEmailOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>Kirim via Gmail</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cetak Kwitansi</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Direct Receipt Email Sender Modal */}
      <SendReceiptEmailModal
        isOpen={isSendEmailOpen}
        onClose={() => setIsSendEmailOpen(false)}
        transaction={transaction}
        onSuccess={(msg) => {
          if (onEmailSent) onEmailSent(msg);
        }}
      />
    </div>
  );
};
