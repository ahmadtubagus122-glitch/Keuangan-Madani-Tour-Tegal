import { CategoryOption, UmrohPackage, Transaction } from '../types';

export const CATEGORIES_IN: CategoryOption[] = [
  { id: 'dp_umroh', name: 'DP / Uang Muka Umroh', type: 'in', color: 'emerald' },
  { id: 'pelunasan_umroh', name: 'Pelunasan Paket Umroh', type: 'in', color: 'teal' },
  { id: 'biaya_paspor_vaksin', name: 'Biaya Paspor & Vaksin KKP', type: 'in', color: 'cyan' },
  { id: 'upgrade_kamar', name: 'Upgrade Kamar (Double/Triple/Bintang 5)', type: 'in', color: 'sky' },
  { id: 'perlengkapan_tambahan', name: 'Perlengkapan Tambahan (Koper/Ihram)', type: 'in', color: 'blue' },
  { id: 'kereta_ziarah_tambahan', name: 'Kereta Cepat Haramain & Ziarah Thaif', type: 'in', color: 'indigo' },
  { id: 'infaq_titipan', name: 'Infaq & Titipan Wakaf Al-Quran', type: 'in', color: 'amber' },
  { id: 'lainnya_masuk', name: 'Pemasukan Lain-lain', type: 'in', color: 'slate' },
];

export const CATEGORIES_OUT: CategoryOption[] = [
  { id: 'tiket_pesawat', name: 'Tiket Pesawat (Saudia/Garuda)', type: 'out', color: 'rose' },
  { id: 'hotel_makkah_madinah', name: 'Hotel Makkah & Madinah', type: 'out', color: 'red' },
  { id: 'visa_asuransi', name: 'Visa Umroh & Asuransi Muassasah', type: 'out', color: 'orange' },
  { id: 'bus_handling', name: 'Transportasi Bus & Handling Bandara', type: 'out', color: 'amber' },
  { id: 'muthawwif_leader', name: 'Honor Muthawwif & Tour Leader', type: 'out', color: 'purple' },
  { id: 'perlengkapan_jamaah', name: 'Pengadaan Koper, Tas & Batik Madani', type: 'out', color: 'violet' },
  { id: 'catering_konsumsi', name: 'Catering & Konsumsi Jamaah', type: 'out', color: 'pink' },
  { id: 'operasional_kantor', name: 'Operasional Kantor Madani Tegal', type: 'out', color: 'stone' },
  { id: 'promosi_marketing', name: 'Brosur, Banner & Promosi Tegal', type: 'out', color: 'yellow' },
  { id: 'lainnya_keluar', name: 'Pengeluaran Lain-lain', type: 'out', color: 'slate' },
];

export const INITIAL_PACKAGES: UmrohPackage[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const AGENCY_PROFILE = {
  name: 'PT MADANI PRABU JAYA CABANG TEGAL',
  tagline: 'Madani Tour Tegal adalah biro pelayanan Haji dan Umroh nomor 1 di Kab. Tegal. Kami memiliki izin resmi dari Kanwil Kementerian Agama Provinsi Jawa Tengah dan terakreditasi.\nUmroh Aman, nyaman, dan tenang\n#IbadahTanpaRagu hanya di Madani Tour',
  permit: 'SK KANWIL KEMENAG NO 181 TAHUN 2020',
  officeAddress: 'Jl. KH. Wahid Hasyim, Kec. Slawi Kabupaten Tegal, Jawa Tengah, Indonesia (Sebelah Selatan Kantor Kementrian Agama Kabupaten Tegal)',
  phone: '0877-8102-7283 / 0822-6430-8489',
  email: 'info@madanitourtegal.com',
  logoUrl: '/assets/aistudio/WhatsApp_Image_2026-10-05_at_09.22.23-removebg-preview_9b32573e.png',
  bankAccounts: [
    { bank: 'BCA (Bank Central Asia)', no: '3620718946', a_n: 'SONO SUGIARTO' },
    { bank: 'Bank Mandiri', no: '1390016430740', a_n: 'SONO SUGIARTO' },
  ]
};
