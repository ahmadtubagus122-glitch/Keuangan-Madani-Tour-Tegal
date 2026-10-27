import React, { useState } from 'react';
import { Mail, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';
import { AGENCY_PROFILE } from '../data/initialData';
import { 
  getAccessToken, 
  googleSignIn, 
  getCurrentUser 
} from '../services/googleAuth';
import { 
  sendGmailEmail, 
  generateReceiptEmailHtml 
} from '../services/gmailService';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmationModal } from './ConfirmationModal';
import { formatRupiah } from '../utils/formatters';

interface SendReceiptEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSuccess: (msg: string) => void;
}

export const SendReceiptEmailModal: React.FC<SendReceiptEmailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSuccess,
}) => {
  if (!isOpen || !transaction) return null;

  const [recipientEmail, setRecipientEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const receiptData = generateReceiptEmailHtml(transaction, AGENCY_PROFILE);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal login dengan akun Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email penerima yang valid.');
      return;
    }
    setErrorMessage(null);
    setIsConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    setIsSending(true);
    setErrorMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Sesi login Google telah berakhir. Silakan login kembali.');
      }

      await sendGmailEmail(token, {
        to: recipientEmail.trim(),
        subject: receiptData.subject,
        bodyHtml: receiptData.html,
        bodyText: receiptData.plainText,
      });

      setIsConfirmOpen(false);
      onClose();
      onSuccess(`Kwitansi resmi berhasil dikirim via Gmail ke ${recipientEmail}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengirim email.');
      setIsConfirmOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Mail className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base">Kirim Kwitansi via Gmail</h3>
                <p className="text-xs text-blue-200">
                  PT MADANI PRABU JAYA (MADANI TOUR TEGAL)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google Account Authentication Status */}
            {!currentUser ? (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-3">
                <div className="text-xs text-slate-600">
                  Untuk mengirim email kwitansi melalui Gmail resmi biro, hubungkan akun Google Anda terlebih dahulu.
                </div>
                <div className="flex justify-center">
                  <GoogleSignInButton
                    onClick={handleSignIn}
                    isLoading={isLoggingIn}
                    text="Hubungkan Akun Gmail"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-emerald-900 font-semibold">Tersambung dengan Gmail:</span>
                    <span className="text-emerald-700 ml-1.5 font-mono">{currentUser.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 border-b border-slate-200 pb-1.5">
                <span>No. Kwitansi:</span>
                <span className="font-mono font-bold text-slate-800">{transaction.receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 border-b border-slate-200 pb-1.5">
                <span>Jamaah / Pembayar:</span>
                <span className="font-bold text-slate-900">{transaction.jamaahName || 'Hamba Allah'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 border-b border-slate-200 pb-1.5">
                <span>Paket / Keterangan:</span>
                <span className="font-semibold text-slate-800">{transaction.packageName || 'Biaya Operasional'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-0.5">
                <span className="font-bold text-emerald-800">Jumlah Nominal:</span>
                <span className="font-black text-emerald-700 text-sm font-mono">
                  {formatRupiah(transaction.amount)}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleOpenConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Jamaah / Penerima Kwitansi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh: jamaah@gmail.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Subjek Email (Otomatis):
                </label>
                <div className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200 font-mono select-all">
                  {receiptData.subject}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                Email akan dikirim lengkap dengan kop resmi PT MADANI PRABU JAYA, detail tanda terima, nomor rekening verifikasi, serta format kwitansi rapi.
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!currentUser || !recipientEmail}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Kwitansi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Explicit Confirmation Modal as required by Workspace integration guidelines */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSend}
        isLoading={isSending}
        title="Konfirmasi Kirim Email Kwitansi"
        description="Apakah Anda yakin ingin mengirim email kwitansi ini ke jamaah? Email akan dikirimkan langsung menggunakan akun Gmail Anda."
        confirmLabel="Ya, Kirim Sekarang"
        cancelLabel="Periksa Lagi"
        details={[
          { label: 'Penerima', value: recipientEmail },
          { label: 'No. Kwitansi', value: transaction.receiptNumber },
          { label: 'Nama Jamaah', value: transaction.jamaahName || 'Hamba Allah' },
          { label: 'Nominal', value: formatRupiah(transaction.amount) },
        ]}
      />
    </>
  );
};
