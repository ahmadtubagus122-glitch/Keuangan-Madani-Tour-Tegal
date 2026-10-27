import React from 'react';
import { 
  Building2, 
  PlusCircle, 
  MinusCircle, 
  Layers, 
  FileSpreadsheet, 
  ShieldCheck, 
  Compass,
  MapPin,
  Mail
} from 'lucide-react';
import { AGENCY_PROFILE } from '../data/initialData';

interface HeaderProps {
  onOpenNewTransaction: (type: 'in' | 'out') => void;
  activeTab: 'transactions' | 'packages' | 'reports' | 'gmail';
  setActiveTab: (tab: 'transactions' | 'packages' | 'reports' | 'gmail') => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTransaction,
  activeTab,
  setActiveTab,
  onOpenExportModal,
}) => {
  return (
    <header className="text-white shadow-lg border-b border-blue-800/60 no-print sticky top-0 z-30" style={{ backgroundColor: '#042cf9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#042cf9' }}>
        {/* Top Info Bar */}
        <div 
          style={{ backgroundColor: '#140bfe' }}
          className="py-3.5 px-3 sm:px-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-blue-400/30 mt-1 mb-1"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-14 sm:h-14 sm:w-16 rounded-xl bg-white p-1 flex items-center justify-center shadow-md ring-2 ring-blue-300/60 shrink-0 overflow-hidden">
              <img 
                src={AGENCY_PROFILE.logoUrl} 
                alt="Logo Madani Tour Cabang Tegal" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight font-sans text-amber-300" style={{ fontSize: '27px' }}>
                  MADANI TOUR TEGAL
                </h1>
                <span 
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-blue-900/80 px-2 py-0.5 rounded-full border border-blue-400/50"
                  style={{ color: '#f1f4a4' }}
                >
                  <ShieldCheck className="w-3 h-3" style={{ color: '#f1f107' }} />
                  PPIU Kemenag RI
                </span>
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 font-medium flex-wrap">
                <span 
                  className="tracking-wide px-2 py-0.5 rounded border border-blue-400/50 shadow-xs inline-block"
                  style={{ backgroundColor: '#063aef', fontWeight: 'bold', color: '#ffe200' }}
                >
                  {AGENCY_PROFILE.name}
                </span>
                <span className="text-blue-300">•</span>
                <span 
                  className="font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded border border-blue-400/40"
                  style={{ color: '#e6f5ee', backgroundColor: '#050af2' }}
                >
                  <MapPin className="w-3 h-3 shrink-0 inline" style={{ color: '#f7f5ef' }} />
                  {AGENCY_PROFILE.officeAddress}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Transaction Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              id="btn-catat-pemasukan"
              onClick={() => onOpenNewTransaction('in')}
              style={{ color: '#eff7f5' }}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 font-bold text-sm rounded-lg shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" style={{ color: '#ebf8f5' }} />
              <span>+ Pemasukan (Kas Masuk)</span>
            </button>
            <button
              id="btn-catat-pengeluaran"
              onClick={() => onOpenNewTransaction('out')}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4 text-rose-100" />
              <span>- Pengeluaran (Kas Keluar)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Tool Actions */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="tab-transaksi"
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'bg-blue-600 text-white border border-blue-300/40 shadow-xs'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800/40'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Buku Kas & Transaksi</span>
            </button>

            <button
              id="tab-paket"
              onClick={() => setActiveTab('packages')}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'packages'
                  ? 'bg-blue-600 text-white border border-blue-300/40 shadow-xs'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800/40'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span 
                className="px-2 py-0.5 rounded"
                style={{ backgroundColor: '#1d4cf2', color: '#ffe200' }}
              >
                Keuangan Paket Umroh
              </span>
            </button>

            <button
              id="tab-rekening"
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'reports' ? 'bg-blue-800 text-white shadow-xs' : 'text-blue-100 hover:text-white hover:bg-blue-800/40'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span style={{ color: '#fff30b' }}>Info Rekening & Kontak Kantor</span>
            </button>

            <button
              id="tab-gmail"
              onClick={() => setActiveTab('gmail')}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'gmail' 
                  ? 'bg-amber-400 text-slate-900 shadow-md font-bold' 
                  : 'text-amber-200 hover:text-amber-100 hover:bg-blue-800/50 bg-blue-900/40 border border-amber-400/40'
              }`}
            >
              <Mail className="w-4 h-4 text-red-500 fill-white" />
              <span>Gmail & Kirim Email</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              id="btn-ekspor-backup"
              onClick={onOpenExportModal}
              style={{ color: '#ffffff', backgroundColor: '#060808' }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-700 hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Ekspor / Unduh Excel & Backup</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
