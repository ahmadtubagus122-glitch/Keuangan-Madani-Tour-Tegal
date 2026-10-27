import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  Copy, 
  Check, 
  Info,
  Clock,
  Compass
} from 'lucide-react';
import { AGENCY_PROFILE } from '../data/initialData';

export const AgencyProfileView: React.FC = () => {
  const [copiedBank, setCopiedBank] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(id);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Profile Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-800/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold tracking-wide text-emerald-100">{AGENCY_PROFILE.permit}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
              {AGENCY_PROFILE.name}
            </h2>

            <p className="text-sm text-emerald-100/95 max-w-2xl leading-relaxed whitespace-pre-line">
              {AGENCY_PROFILE.tagline}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                {AGENCY_PROFILE.officeAddress}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-center min-w-[200px] shrink-0 flex flex-col items-center">
            <div className="w-24 h-16 bg-white rounded-lg p-1.5 shadow-sm flex items-center justify-center mb-2">
              <img 
                src={AGENCY_PROFILE.logoUrl} 
                alt="Logo Madani Tour" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold block">
              Pusat Pelayanan Tegal
            </span>
            <span className="text-sm font-extrabold text-white mt-0.5 block">
              Senin - Sabtu: 08:00 - 17:00
            </span>
            <span className="text-[11px] text-emerald-300 mt-1 block">
              Konsultasi Jamaah & Manasik
            </span>
          </div>
        </div>
      </div>

      {/* Official Bank Accounts for Payment Verification */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              Rekening Bank Resmi Penampungan Dana Umroh
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh transaksi jamaah disetorkan melalui rekening resmi berikut demi keamanan transaksi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AGENCY_PROFILE.bankAccounts.map((b, idx) => (
            <div
              key={idx}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative group hover:border-emerald-300 transition-colors"
            >
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {b.bank}
              </div>
              <div className="font-mono text-base font-extrabold text-slate-900 flex items-center justify-between">
                <span>{b.no}</span>
                <button
                  onClick={() => copyToClipboard(b.no, b.bank)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors cursor-pointer"
                  title="Salin No Rekening"
                >
                  {copiedBank === b.bank ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                a.n. <strong className="text-slate-800">{b.a_n}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Operational Guidelines for Umroh Financials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-700" />
            Standar Operasional Prosedur (SOP) Pembayaran
          </h4>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed list-disc list-inside">
            <li>
              <strong>DP / Uang Muka Umroh:</strong> Minimal Rp 5.000.000 / Pax untuk penguncian seat pesawat & kamar hotel.
            </li>
            <li>
              <strong>Pelunasan Biaya Paket:</strong> Wajib diselesaikan paling lambat H-30 sebelum jadwal keberangkatan ke Saudi Arabia.
            </li>
            <li>
              <strong>Biaya Dokumen Tambahan:</strong> Suntik vaksin Meningitis KKP dapat dibayarkan terpisah atau kolektif.
            </li>
            <li>
              <strong>Cetak Kwitansi:</strong> Setiap pembayaran masuk wajib dicetak dan distempel oleh kasir Madani Tour Tegal serta diserahkan kepada jamaah.
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-slate-600" />
            Kontak dan Bantuan Keuangan
          </h4>
          <div className="text-xs text-slate-600 space-y-2">
            <p>
              <strong>WhatsApp:</strong> {AGENCY_PROFILE.phone}
            </p>
            <p>
              <strong>Email Konfirmasi Kasir:</strong> {AGENCY_PROFILE.email}
            </p>
            <p>
              <strong>Layanan Jamaah:</strong> Jl KH Wahid Hasyim, Kec. Slawi Kabupaten Tegal, Jawa Tengah, Indonesia (Sebelah Selatan Kantor Kementrian Agama Kabupaten Tegal)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
