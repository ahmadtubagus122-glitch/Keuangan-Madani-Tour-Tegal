import React, { useState } from 'react';
import { 
  Layers, 
  Calendar, 
  Plane, 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Check, 
  X,
  ChevronDown,
  ChevronUp,
  Receipt,
  Trash2
} from 'lucide-react';
import { UmrohPackage, Transaction } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface PackageFinancialsProps {
  packages: UmrohPackage[];
  transactions: Transaction[];
  onAddPackage: (pkg: UmrohPackage) => void;
  onDeletePackage?: (pkgId: string) => void;
  onSelectTransactionReceipt: (tx: Transaction) => void;
}

export const PackageFinancials: React.FC<PackageFinancialsProps> = ({
  packages,
  transactions,
  onAddPackage,
  onDeletePackage,
  onSelectTransactionReceipt,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(packages[0]?.id || null);

  // New package form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pricePerPax, setPricePerPax] = useState<number>(32000000);
  const [hotelMakkah, setHotelMakkah] = useState('Anjum Hotel Makkah (Bintang 5)');
  const [hotelMadinah, setHotelMadinah] = useState('Front Taiba Madinah (Bintang 4)');
  const [airline, setAirline] = useState('Saudia Airlines (Direct)');
  const [targetPax, setTargetPax] = useState<number>(45);

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPkg: UmrohPackage = {
      id: `pkg-${Date.now()}`,
      name: name.trim(),
      code: code.trim() || `UMR-${Math.floor(100 + Math.random() * 900)}`,
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      returnDate: returnDate || new Date().toISOString().split('T')[0],
      pricePerPax,
      hotelMakkah,
      hotelMadinah,
      airline,
      targetPax,
      active: true,
    };

    onAddPackage(newPkg);
    setShowAddModal(false);
    setName('');
    setCode('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Analisis Keuangan per Paket & Jadwal Keberangkatan Umroh
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hitung keuntungan, arus dana masuk jamaah, dan rincian belanja operasional (tiket, hotel, visa) per grup keberangkatan Madani Tour Tegal.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 gap-5">
        {packages.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-dashed border-slate-300 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Belum Ada Paket Keberangkatan Umroh</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Semua paket keberangkatan umroh telah dihapus. Anda dapat menambahkan jadwal paket keberangkatan baru kapan saja untuk mulai melacak keuangan per rombongan Madani Tour Cabang Tegal.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Paket Umroh Baru</span>
            </button>
          </div>
        ) : (
          packages.map((pkg) => {
            const pkgTransactions = transactions.filter((t) => t.packageId === pkg.id);
            const pkgIn = pkgTransactions
              .filter((t) => t.type === 'in')
              .reduce((acc, t) => acc + t.amount, 0);
            const pkgOut = pkgTransactions
              .filter((t) => t.type === 'out')
              .reduce((acc, t) => acc + t.amount, 0);
            const pkgProfit = pkgIn - pkgOut;
            const isExpanded = expandedPackageId === pkg.id;

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all"
              >
                {/* Header section */}
                <div className="p-5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                        {pkg.code}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {pkg.name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Berangkat: <strong>{formatDateIndo(pkg.departureDate)}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Plane className="w-3.5 h-3.5 text-slate-400" />
                        {pkg.airline}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {pkg.hotelMakkah}
                      </span>
                    </div>
                  </div>

                  {/* Financial Summary Snippet */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] uppercase font-bold text-slate-400 block">
                        Laba / Margin Paket
                      </span>
                      <span
                        className={`text-lg font-extrabold ${
                          pkgProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {formatRupiah(pkgProfit)}
                      </span>
                    </div>

                    {onDeletePackage && (
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.name}"?`)) {
                            onDeletePackage(pkg.id);
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Paket Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedPackageId(isExpanded ? null : pkg.id)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title={isExpanded ? 'Tutup Rincian' : 'Buka Rincian'}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

              {/* Progress & Breakdown Grid */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Dana Masuk dari Jamaah
                  </span>
                  <div className="text-base font-extrabold text-emerald-700 mt-1">
                    {formatRupiah(pkgIn)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Harga Paket: {formatRupiah(pkg.pricePerPax)} / Pax
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    Biaya Operasional Keluar
                  </span>
                  <div className="text-base font-extrabold text-rose-600 mt-1">
                    {formatRupiah(pkgOut)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Tiket, Hotel, Visa, Perlengkapan
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold">
                    Persentase Margin Laba
                  </span>
                  <div className="text-base font-extrabold text-slate-900 mt-1">
                    {pkgIn > 0 ? Math.round((pkgProfit / pkgIn) * 100) : 0}%
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {pkgTransactions.length} Transaksi Terkait
                  </span>
                </div>
              </div>

              {/* Expanded Detail View: Associated Transactions */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Rincian Pembukuan Transaksi untuk {pkg.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {pkgTransactions.length} Transaksi
                    </span>
                  </div>

                  {pkgTransactions.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      Belum ada transaksi pemasukan maupun pengeluaran yang dialokasikan ke paket ini.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                          <tr>
                            <th className="px-3 py-2">Tanggal</th>
                            <th className="px-3 py-2">No. Bukti</th>
                            <th className="px-3 py-2">Pihak / Jamaah / Rincian</th>
                            <th className="px-3 py-2">Jenis</th>
                            <th className="px-3 py-2 text-right">Nominal</th>
                            <th className="px-3 py-2 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pkgTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2.5 font-mono text-slate-600">
                                {tx.date}
                              </td>
                              <td className="px-3 py-2.5 font-mono font-bold text-slate-700">
                                {tx.receiptNumber}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="font-semibold text-slate-900">
                                  {tx.jamaahName || tx.notes}
                                </span>
                                {tx.notes && tx.jamaahName && (
                                  <p className="text-[11px] text-slate-500">{tx.notes}</p>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    tx.type === 'in'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {tx.type === 'in' ? 'Masuk' : 'Keluar'}
                                </span>
                              </td>
                              <td
                                className={`px-3 py-2.5 text-right font-extrabold ${
                                  tx.type === 'in' ? 'text-emerald-700' : 'text-rose-600'
                                }`}
                              >
                                {tx.type === 'in' ? '+' : '-'} {formatRupiah(tx.amount)}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <button
                                  onClick={() => onSelectTransactionReceipt(tx)}
                                  className="p-1 hover:bg-slate-100 text-emerald-700 rounded transition-colors cursor-pointer"
                                  title="Cetak Kwitansi"
                                >
                                  <Receipt className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {/* Modal Add New Package */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-200">
                  Madani Tour Tegal
                </span>
                <h3 className="text-base font-bold">Tambah Paket Keberangkatan Umroh</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Paket Keberangkatan *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Paket Umroh Awal Musim 1447 H (9 Hari)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Paket
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: AWL-1447"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga per Jamaah (Rupiah)
                  </label>
                  <input
                    type="number"
                    value={pricePerPax}
                    onChange={(e) => setPricePerPax(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Berangkat
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Pulang
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maskapai Penerbangan
                </label>
                <input
                  type="text"
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  placeholder="Saudia Airlines / Garuda Indonesia"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hotel Makkah
                  </label>
                  <input
                    type="text"
                    value={hotelMakkah}
                    onChange={(e) => setHotelMakkah(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hotel Madinah
                  </label>
                  <input
                    type="text"
                    value={hotelMadinah}
                    onChange={(e) => setHotelMadinah(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Paket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
