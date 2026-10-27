import { PaymentMethod } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateFull(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): { label: string; bank: string; color: string } {
  switch (method) {
    case 'transfer_bsi':
      return { label: 'BSI (Bank Syariah Indonesia)', bank: 'BSI', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'transfer_bca':
      return { label: 'BCA (Bank Central Asia)', bank: 'BCA', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'transfer_mandiri':
      return { label: 'Bank Mandiri', bank: 'Mandiri', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'transfer_bri':
      return { label: 'Bank BRI', bank: 'BRI', color: 'bg-sky-50 text-sky-800 border-sky-200' };
    case 'cash':
      return { label: 'Tunai di Kantor Tegal', bank: 'Kas Tunai', color: 'bg-stone-100 text-stone-800 border-stone-300' };
    case 'qris':
      return { label: 'QRIS Madani Tour', bank: 'QRIS', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    default:
      return { label: method, bank: 'Lainnya', color: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
}

// Convert numbers to Indonesian word representation for receipts (Kwitansi)
export function terbilang(n: number): string {
  if (n === 0) return 'Nol Rupiah';
  if (n < 0) return 'Minus ' + terbilang(Math.abs(n));

  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function convert(num: number): string {
    if (num < 12) {
      return satuan[num];
    } else if (num < 20) {
      return convert(num - 10) + ' Belas';
    } else if (num < 100) {
      return convert(Math.floor(num / 10)) + ' Puluh' + (num % 10 !== 0 ? ' ' + convert(num % 10) : '');
    } else if (num < 200) {
      return 'Seratus' + (num - 100 !== 0 ? ' ' + convert(num - 100) : '');
    } else if (num < 1000) {
      return convert(Math.floor(num / 100)) + ' Ratus' + (num % 100 !== 0 ? ' ' + convert(num % 100) : '');
    } else if (num < 2000) {
      return 'Seribu' + (num - 1000 !== 0 ? ' ' + convert(num - 1000) : '');
    } else if (num < 1000000) {
      return convert(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
    } else if (num < 1000000000) {
      return convert(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 !== 0 ? ' ' + convert(num % 1000000) : '');
    } else if (num < 1000000000000) {
      return convert(Math.floor(num / 1000000000)) + ' Miliar' + (num % 1000000000 !== 0 ? ' ' + convert(num % 1000000000) : '');
    } else {
      return convert(Math.floor(num / 1000000000000)) + ' Triliun' + (num % 1000000000000 !== 0 ? ' ' + convert(num % 1000000000000) : '');
    }
  }

  const result = convert(Math.floor(n)).trim() + ' Rupiah';
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function generateReceiptNumber(type: 'in' | 'out'): string {
  const prefix = type === 'in' ? 'KWT-MDT' : 'BKK-MDT'; // KWT = Kwitansi Masuk, BKK = Bukti Kas Keluar
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}/${year}/${randomSuffix}`;
}
