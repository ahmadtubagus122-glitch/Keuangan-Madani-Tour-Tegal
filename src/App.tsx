import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  UmrohPackage, 
  TransactionType 
} from './types';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_PACKAGES, 
  AGENCY_PROFILE 
} from './data/initialData';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { ReceiptModal } from './components/ReceiptModal';
import { PackageFinancials } from './components/PackageFinancials';
import { AgencyProfileView } from './components/AgencyProfileView';
import { ExportImportModal } from './components/ExportImportModal';
import { GmailView } from './components/GmailView';
import { CheckCircle2, HeartHandshake } from 'lucide-react';

const STORAGE_KEY_TX = 'madani_tour_transactions_clean_rp0';
const STORAGE_KEY_PKG = 'madani_tour_packages_clean_empty';

export default function App() {
  // Load state from localStorage or fallback to empty Rp 0 initial transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      localStorage.removeItem('madani_tour_transactions_v1');
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [packages, setPackages] = useState<UmrohPackage[]>(() => {
    try {
      localStorage.removeItem('madani_tour_packages_v1');
      const saved = localStorage.getItem(STORAGE_KEY_PKG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load packages from localStorage', e);
    }
    return INITIAL_PACKAGES;
  });

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'transactions' | 'packages' | 'reports' | 'gmail'>('transactions');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('in');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PKG, JSON.stringify(packages));
    } catch (e) {
      console.error('Failed to save packages to localStorage', e);
    }
  }, [packages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Action Handlers
  const handleOpenNewTransaction = (type: 'in' | 'out') => {
    setEditingTransaction(null);
    setModalInitialType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalInitialType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (savedTx: Transaction) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === savedTx.id ? savedTx : t))
      );
      showToast(`Transaksi ${savedTx.receiptNumber} berhasil diperbarui.`);
    } else {
      setTransactions((prev) => [savedTx, ...prev]);
      showToast(`Transaksi baru ${savedTx.receiptNumber} berhasil dicatat.`);
      // Offer opening the receipt right away for cash in
      if (savedTx.type === 'in') {
        setSelectedReceiptTx(savedTx);
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaksi telah berhasil dihapus.');
  };

  const handleAddPackage = (newPkg: UmrohPackage) => {
    setPackages((prev) => [...prev, newPkg]);
    showToast(`Paket umroh "${newPkg.name}" berhasil ditambahkan.`);
  };

  const handleDeletePackage = (pkgId: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== pkgId));
    showToast('Paket umroh berhasil dihapus.');
  };

  const handleRestoreData = (newTx: Transaction[], newPkgs: UmrohPackage[]) => {
    setTransactions(newTx);
    setPackages(newPkgs);
    showToast('Data pembukuan berhasil dimuat ulang.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-emerald-700 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        onOpenNewTransaction={handleOpenNewTransaction}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Executive Stats (Always visible for quick pulse on company cash flow) */}
        <StatsOverview transactions={transactions} />

        {/* Tab Content 1: Buku Kas & Transaksi */}
        {activeTab === 'transactions' && (
          <TransactionTable
            transactions={transactions}
            packages={packages}
            onOpenReceipt={(tx) => setSelectedReceiptTx(tx)}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewTransaction={handleOpenNewTransaction}
          />
        )}

        {/* Tab Content 2: Keuangan Paket Umroh */}
        {activeTab === 'packages' && (
          <PackageFinancials
            packages={packages}
            transactions={transactions}
            onAddPackage={handleAddPackage}
            onDeletePackage={handleDeletePackage}
            onSelectTransactionReceipt={(tx) => setSelectedReceiptTx(tx)}
          />
        )}

        {/* Tab Content 3: Rekening & Info Kantor Madani Tegal */}
        {activeTab === 'reports' && <AgencyProfileView />}

        {/* Tab Content 4: Gmail & Komunikasi Jamaah */}
        {activeTab === 'gmail' && <GmailView />}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-semibold">
              {AGENCY_PROFILE.name}
            </span>
            <span className="text-slate-600">•</span>
            <span>Sistem Pembukuan Keuangan Umroh & Haji Khusus</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Izin Kemenag PPIU: {AGENCY_PROFILE.permit}
          </div>
        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialType={modalInitialType}
        editingTransaction={editingTransaction}
        packages={packages}
      />

      {/* Official Receipt / Kwitansi Modal */}
      <ReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
        onEmailSent={showToast}
      />

      {/* Export & Backup Modal */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        packages={packages}
        onRestoreData={handleRestoreData}
      />
    </div>
  );
}
