import React, { useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Transaction, UmrohPackage } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_PACKAGES } from '../data/initialData';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  packages: UmrohPackage[];
  onRestoreData: (transactions: Transaction[], packages: UmrohPackage[]) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  packages,
  onRestoreData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export to Excel CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Tanggal',
      'No_Kwitansi',
      'Jenis_Transaksi',
      'Kategori',
      'Nominal_IDR',
      'Nama_Jamaah',
      'No_HP_Jamaah',
      'Paket_Umroh',
      'Rekening_Pembayaran',
      'Keterangan',
      'Petugas_Kasir',
      'Status',
    ];

    const rows = transactions.map((t, idx) => [
      idx + 1,
      `"${t.date}"`,
      `"${t.receiptNumber}"`,
      `"${t.type === 'in' ? 'PEMASUKAN' : 'PENGELUARAN'}"`,
      `"${t.category}"`,
      t.amount,
      `"${(t.jamaahName || '').replace(/"/g, '""')}"`,
      `"${(t.jamaahPhone || '').replace(/"/g, '""')}"`,
      `"${(t.packageName || 'Biaya Umum').replace(/"/g, '""')}"`,
      `"${t.paymentMethod}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${(t.handledBy || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Laporan_Keuangan_Madani_Tour_Tegal_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      agency: 'Madani Tour Tegal (PT Madani Bina Insani)',
      transactions,
      packages,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Backup_Kas_Madani_Tour_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Restore from JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.transactions)) {
          onRestoreData(
            parsed.transactions,
            Array.isArray(parsed.packages) ? parsed.packages : packages
          );
          alert('Data pembukuan berhasil dipulihkan dari file backup!');
          onClose();
        } else {
          alert('Format file JSON tidak valid atau tidak memiliki data transaksi.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON. Pastikan file backup valid.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to clean Rp 0 data
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan semua transaksi buku kas dan memulai dari Rp 0?')) {
      onRestoreData([], packages);
      alert('Buku kas berhasil dikosongkan ke Rp 0.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Ekspor, Cadangan & Pemulihan Kas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Card 1: Excel CSV Export */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Unduh Laporan Excel (CSV)
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Format tabel lengkap siap dibuka di Microsoft Excel, Google Spreadsheet, atau LibreOffice.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>

          {/* Card 2: JSON Backup */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Cadangan Data Lengkap (JSON)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Simpan salinan database lokal lengkap transaksi dan paket umroh untuk keamanan arsip.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>
          </div>

          {/* Card 3: Restore Backup */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Pulihkan Data dari File
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Unggah file cadangan JSON yang sebelumnya pernah diunduh.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah File</span>
              </button>
            </div>
          </div>

          {/* Card 4: Reset to Zero */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Mulai pembukuan baru dari awal?</span>
            <button
              onClick={handleResetData}
              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kosongkan Kas (Mulai Rp 0)</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
