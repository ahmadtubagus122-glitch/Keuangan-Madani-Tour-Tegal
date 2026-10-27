import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Receipt, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  Download
} from 'lucide-react';
import { Transaction, TransactionType, UmrohPackage } from '../types';
import { CATEGORIES_IN, CATEGORIES_OUT } from '../data/initialData';
import { formatRupiah, formatDateIndo, getPaymentMethodLabel } from '../utils/formatters';

interface TransactionTableProps {
  transactions: Transaction[];
  packages: UmrohPackage[];
  onOpenReceipt: (tx: Transaction) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: (type: 'in' | 'out') => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  packages,
  onOpenReceipt,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7days' | 'this_month' | 'this_year'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logic
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return transactions.filter((t) => {
      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }

      // Package filter
      if (packageFilter !== 'all') {
        if (packageFilter === 'unassigned' && t.packageId) return false;
        if (packageFilter !== 'unassigned' && t.packageId !== packageFilter) return false;
      }

      // Date range filter
      if (dateRangeFilter === 'today') {
        if (t.date !== todayStr) return false;
      } else if (dateRangeFilter === '7days') {
        const txDate = new Date(t.date);
        const diffDays = (today.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (dateRangeFilter === 'this_month') {
        const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
        if (!t.date.startsWith(currentMonth)) return false;
      } else if (dateRangeFilter === 'this_year') {
        const currentYear = today.getFullYear().toString();
        if (!t.date.startsWith(currentYear)) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchJamaah = t.jamaahName?.toLowerCase().includes(q);
        const matchReceipt = t.receiptNumber.toLowerCase().includes(q);
        const matchNotes = t.notes.toLowerCase().includes(q);
        const matchPkg = t.packageName?.toLowerCase().includes(q);
        const matchPhone = t.jamaahPhone?.toLowerCase().includes(q);
        if (!matchJamaah && !matchReceipt && !matchNotes && !matchPkg && !matchPhone) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, packageFilter, dateRangeFilter, searchTerm]);

  // Totals for filtered data
  const filteredIn = filteredTransactions
    .filter((t) => t.type === 'in')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredOut = filteredTransactions
    .filter((t) => t.type === 'out')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredNet = filteredIn - filteredOut;

  // Pagination slice
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const allCategories = [...CATEGORIES_IN, ...CATEGORIES_OUT];
  const getCategoryName = (catId: string) => {
    const found = allCategories.find((c) => c.id === catId);
    return found ? found.name : catId;
  };

  const handleDelete = (id: string) => {
    onDeleteTransaction(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls Card */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Top search & quick type filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama jamaah, no. kwitansi, atau keperluan pembayaran..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto">
            <button
              onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              onClick={() => { setTypeFilter('in'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === 'in'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Pemasukan
            </button>
            <button
              onClick={() => { setTypeFilter('out'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === 'out'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:bg-rose-50'
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5" />
              Pengeluaran
            </button>
          </div>
        </div>

        {/* Second Row: Detailed Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Period Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Periode Waktu
            </label>
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="this_month">Bulan Ini</option>
              <option value="this_year">Tahun Ini</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Kategori Transaksi
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">Semua Kategori</option>
              <optgroup label="Kategori Pemasukan">
                {CATEGORIES_IN.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
              <optgroup label="Kategori Pengeluaran">
                {CATEGORIES_OUT.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Package Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Alokasi Paket Umroh
            </label>
            <select
              value={packageFilter}
              onChange={(e) => {
                setPackageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">Semua Paket Umroh</option>
              <option value="unassigned">Non-Paket (Operasional Kantor)</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Strip */}
        <div className="bg-slate-50 px-3 py-2 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs border border-slate-200/60">
          <span className="text-slate-600 font-medium">
            Menampilkan <strong>{filteredTransactions.length}</strong> transaksi terpilih
          </span>

          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-semibold">
              Masuk: <strong>{formatRupiah(filteredIn)}</strong>
            </span>
            <span className="text-rose-700 font-semibold">
              Keluar: <strong>{formatRupiah(filteredOut)}</strong>
            </span>
            <span className="text-slate-800 font-bold border-l pl-3 border-slate-300">
              Net: <strong>{formatRupiah(filteredNet)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Tidak ada transaksi ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada data yang cocok dengan kriteria pencarian atau filter yang dipilih.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                  setPackageFilter('all');
                  setDateRangeFilter('all');
                }}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold cursor-pointer"
              >
                Reset Filter
              </button>
              <button
                onClick={() => onOpenNewTransaction('in')}
                className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold cursor-pointer"
              >
                + Catat Transaksi Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tanggal & Bukti</th>
                  <th className="px-4 py-3">Jenis & Kategori</th>
                  <th className="px-4 py-3">Pihak / Jamaah & Rincian</th>
                  <th className="px-4 py-3">Paket Umroh</th>
                  <th className="px-4 py-3">Metode Bayar</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-center">Kwitansi & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions.map((tx) => {
                  const isCashIn = tx.type === 'in';
                  const method = getPaymentMethodLabel(tx.paymentMethod);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Tanggal & No Kwitansi */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {formatDateIndo(tx.date)}
                        </div>
                        <button
                          onClick={() => onOpenReceipt(tx)}
                          className="font-mono text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline decoration-dotted flex items-center gap-1 cursor-pointer"
                          title="Klik untuk membuka & mencetak kwitansi"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>{tx.receiptNumber}</span>
                        </button>
                      </td>

                      {/* Tipe & Kategori */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            isCashIn
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {isCashIn ? '+' : '-'} {isCashIn ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                        <div className="text-slate-600 font-medium text-[11px] mt-1">
                          {getCategoryName(tx.category)}
                        </div>
                      </td>

                      {/* Jamaah / Rincian */}
                      <td className="px-4 py-3 max-w-xs">
                        {tx.jamaahName ? (
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                            <span>{tx.jamaahName}</span>
                            {tx.jamaahPhone && (
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({tx.jamaahPhone})
                              </span>
                            )}
                          </div>
                        ) : null}
                        <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">
                          {tx.notes || '-'}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          Oleh: {tx.handledBy}
                        </span>
                      </td>

                      {/* Paket Umroh */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {tx.packageName ? (
                          <span className="inline-block bg-slate-100 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200 max-w-[180px] truncate" title={tx.packageName}>
                            {tx.packageName}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            Operasional Kantor
                          </span>
                        )}
                      </td>

                      {/* Rekening / Cara Bayar */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${method.color}`}
                        >
                          {method.bank}
                        </span>
                      </td>

                      {/* Nominal */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span
                          className={`text-sm font-black font-mono ${
                            isCashIn ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isCashIn ? '+' : '-'} {formatRupiah(tx.amount)}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenReceipt(tx)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer"
                            title="Cetak Kwitansi Tanda Terima"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Edit Transaksi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total <strong>{filteredTransactions.length}</strong> catatan)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-md border border-slate-300 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 3), currentPage + 2)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-md font-bold text-xs cursor-pointer ${
                    currentPage === page
                      ? 'bg-emerald-700 text-white'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-md border border-slate-300 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">Hapus Data Transaksi?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini akan menghapus catatan pembukuan ini secara permanen dari buku kas Madani Tour Tegal.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
