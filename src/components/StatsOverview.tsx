import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight,
  Landmark,
  Banknote
} from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';

interface StatsOverviewProps {
  transactions: Transaction[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ transactions }) => {
  const totalIn = transactions
    .filter((t) => t.type === 'in')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOut = transactions
    .filter((t) => t.type === 'out')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIn - totalOut;

  // Breakdown by accounts
  const bsiBalance = transactions.reduce((acc, t) => {
    if (t.paymentMethod === 'transfer_bsi') {
      return acc + (t.type === 'in' ? t.amount : -t.amount);
    }
    return acc;
  }, 0);

  const bcaBalance = transactions.reduce((acc, t) => {
    if (t.paymentMethod === 'transfer_bca') {
      return acc + (t.type === 'in' ? t.amount : -t.amount);
    }
    return acc;
  }, 0);

  const mandiriBalance = transactions.reduce((acc, t) => {
    if (t.paymentMethod === 'transfer_mandiri') {
      return acc + (t.type === 'in' ? t.amount : -t.amount);
    }
    return acc;
  }, 0);

  const cashBalance = transactions.reduce((acc, t) => {
    if (t.paymentMethod === 'cash') {
      return acc + (t.type === 'in' ? t.amount : -t.amount);
    }
    return acc;
  }, 0);

  const totalTransactions = transactions.length;
  const inCount = transactions.filter((t) => t.type === 'in').length;
  const outCount = transactions.filter((t) => t.type === 'out').length;

  return (
    <section className="no-print mb-6">
      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Kas Bersih */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saldo Kas Tersedia
            </span>
            <div className={`p-2 rounded-lg ${balance > 0 ? 'bg-emerald-50 text-emerald-600' : balance < 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${balance > 0 ? 'text-emerald-700' : balance < 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {formatRupiah(balance)}
            </h3>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <span className={`inline-block w-2 h-2 rounded-full ${balance > 0 ? 'bg-emerald-500' : balance < 0 ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
              {balance === 0 ? 'Saldo awal Rp 0 (Siap pencatatan baru)' : 'Total akumulasi dana operasional aktif'}
            </p>
          </div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pemasukan (In)
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${totalIn > 0 ? 'text-emerald-600' : 'text-slate-900'} flex items-center gap-1`}>
              {formatRupiah(totalIn)}
            </h3>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {inCount} transaksi masuk
              </span>
              <span>DP & Pelunasan Umroh</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pengeluaran (Out)
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${totalOut > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {formatRupiah(totalOut)}
            </h3>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center text-rose-600 font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {outCount} transaksi keluar
              </span>
              <span>Tiket, Hotel, Visa & Ops</span>
            </div>
          </div>
        </div>

        {/* Card 4: Rasio Surplus / Margin */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Surplus / Rasio Kas
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {totalIn > 0 ? Math.round((balance / totalIn) * 100) : 0}%
              </h3>
              <span className="text-xs font-medium text-slate-500">margin kas aktif</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${totalIn + totalOut > 0 ? (totalIn / (totalIn + totalOut)) * 100 : 0}%` }}
                title="Porsi Masuk"
              />
              <div 
                className="bg-rose-500 h-full transition-all"
                style={{ width: `${totalIn + totalOut > 0 ? (totalOut / (totalIn + totalOut)) * 100 : 0}%` }}
                title="Porsi Keluar"
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-slate-500 font-medium">
              <span className="text-emerald-700">Masuk {totalIn + totalOut > 0 ? Math.round((totalIn / (totalIn + totalOut)) * 100) : 0}%</span>
              <span className="text-rose-700">Keluar {totalIn + totalOut > 0 ? Math.round((totalOut / (totalIn + totalOut)) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balances Ribbon */}
      <div className="mt-4 bg-slate-900 text-slate-200 rounded-xl p-3.5 sm:p-4 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Distribusi Saldo Rekening & Kas Kantor Tegal
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Total {totalTransactions} Catatan Pembukuan Terdaftar
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-blue-400">BCA</span>
              <span className="text-[10px] text-slate-400 font-mono">3620718946</span>
            </div>
            <div className="font-bold text-sm text-white">{formatRupiah(bcaBalance)}</div>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-amber-400">Bank Mandiri</span>
              <span className="text-[10px] text-slate-400 font-mono">1390016430740</span>
            </div>
            <div className="font-bold text-sm text-white">{formatRupiah(mandiriBalance)}</div>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-emerald-300 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" />
                Kas Tunai Kantor
              </span>
            </div>
            <div className="font-bold text-sm text-white">{formatRupiah(cashBalance)}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
