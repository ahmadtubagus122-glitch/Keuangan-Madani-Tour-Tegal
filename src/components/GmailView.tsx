import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Inbox, 
  Send, 
  RefreshCw, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  FileText, 
  Clock, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  getCurrentUser, 
  logout 
} from '../services/googleAuth';
import { 
  getGmailUserProfile, 
  listGmailMessages, 
  getGmailMessage, 
  sendGmailEmail, 
  trashGmailMessage, 
  GmailProfile, 
  GmailMessageDetail, 
  SendEmailPayload 
} from '../services/gmailService';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmationModal } from './ConfirmationModal';
import { AGENCY_PROFILE } from '../data/initialData';

export const GmailView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [userProfile, setUserProfile] = useState<GmailProfile | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<GmailMessageDetail[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Compose State
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Confirmation Modals State (Mandatory for destructive/send operations)
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageToTrash, setMessageToTrash] = useState<GmailMessageDetail | null>(null);
  const [isTrashing, setIsTrashing] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        loadUserProfile(token);
      },
      () => {
        setCurrentUser(null);
        setUserProfile(null);
        setMessages([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (token: string) => {
    try {
      const profile = await getGmailUserProfile(token);
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const loadMessages = useCallback(async (tab: 'inbox' | 'sent' = activeSubTab as any, query: string = searchQuery) => {
    setIsLoadingMessages(true);
    setErrorBanner(null);
    try {
      const token = await getAccessToken();
      if (!token) return;

      const labelIds = tab === 'inbox' ? ['INBOX'] : ['SENT'];
      const res = await listGmailMessages(token, {
        maxResults: 15,
        q: query.trim() || undefined,
        labelIds,
      });

      if (!res.messages || res.messages.length === 0) {
        setMessages([]);
        setIsLoadingMessages(false);
        return;
      }

      // Fetch message details in parallel
      const details = await Promise.all(
        res.messages.slice(0, 15).map(async (m) => {
          try {
            return await getGmailMessage(token, m.id);
          } catch (e) {
            return null;
          }
        })
      );

      setMessages(details.filter((d): d is GmailMessageDetail => d !== null));
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal memuat pesan email.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [activeSubTab, searchQuery]);

  // Load messages on login or tab change
  useEffect(() => {
    if (currentUser && (activeSubTab === 'inbox' || activeSubTab === 'sent')) {
      loadMessages(activeSubTab);
    }
  }, [currentUser, activeSubTab, loadMessages]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorBanner(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        await loadUserProfile(res.accessToken);
        showToast('Berhasil terhubung dengan akun Google.');
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setUserProfile(null);
    setMessages([]);
    setSelectedMessage(null);
    showToast('Telah keluar dari akun Google.');
  };

  const handleApplyTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (templateKey === 'manasik') {
      setComposeSubject(`[Informasi Manasik Umroh] ${AGENCY_PROFILE.name}`);
      setComposeBody(
`Assalamu'alaikum Wr. Wb.

Bapak/Ibu Jamaah Calon Tamu Allah yang dirahmati Allah SWT,

Bersama ini kami dari ${AGENCY_PROFILE.name} memberitahukan jadwal pelaksanaan Bimbingan Manasik Umroh:

📅 Hari/Tanggal : [Tentukan Tanggal]
⏰ Waktu         : 08.30 WIB - Selesai
📍 Tempat        : Kantor Madani Tour Tegal
                  (${AGENCY_PROFILE.officeAddress})
👔 Pakaian       : Busana Muslim / Muslimah Rapih & Sopan

Agenda:
1. Pembekalan Tata Cara Ibadah Umroh Sesuai Sunnah
2. Penjelasan Rundown Perjalanan & Hotel di Madinah - Makkah
3. Pembagian Perlengkapan Jamaah (Koper, Kain Ihram/Mukena, Tas Paspor, Seragam)

Mohon kehadiran tepat waktu. Bila ada pertanyaan silakan hubungi kami via WhatsApp di ${AGENCY_PROFILE.phone}.

Wassalamu'alaikum Wr. Wb.
${AGENCY_PROFILE.name}`
      );
    } else if (templateKey === 'dokumen') {
      setComposeSubject(`[Pengingat Dokumen & Paspor] ${AGENCY_PROFILE.name}`);
      setComposeBody(
`Assalamu'alaikum Wr. Wb.

Yth. Bapak/Ibu Jamaah Umroh,

Dalam rangka proses administrasi visa dan tiket penerbangan Umroh bersama ${AGENCY_PROFILE.name}, kami mengingatkan agar segera melengkapi dokumen berikut:

1. Paspor Asli (Masa berlaku minimal 7 bulan sebelum tanggal keberangkatan)
2. Fotokopi Kartu Tanda Penduduk (KTP) & Kartu Keluarga (KK)
3. Pas Foto Terbaru Background Putih 4x6 (2 lembar)
4. Buku Nikah Asli (bagi suami-istri) / Akta Lahir Asli (bagi anak)
5. Sertifikat Vaksin Meningitis

Dokumen dapat diserahkan langsung ke kantor kami:
${AGENCY_PROFILE.officeAddress}
(Sebelah Selatan Kantor Kementerian Agama Kab. Tegal)

WhatsApp Layanan: ${AGENCY_PROFILE.phone}

Terima kasih atas kerjasamanya.
Wassalamu'alaikum Wr. Wb.
Tim Administrasi ${AGENCY_PROFILE.name}`
      );
    } else if (templateKey === 'konfirmasi') {
      setComposeSubject(`[Konfirmasi Pendaftaran Paket Umroh] ${AGENCY_PROFILE.name}`);
      setComposeBody(
`Assalamu'alaikum Wr. Wb.

Alhamdulillah, terima kasih atas pendaftaran dan kepercayaan Bapak/Ibu untuk menunaikan ibadah Umroh bersama ${AGENCY_PROFILE.name}.

Detail Pendaftaran:
- Nama Jamaah   : [Nama Jamaah]
- Pilihan Paket : [Nama Paket Umroh]
- Tanggal Keberangkatan : [Bulan / Tahun]
- No. Registrasi: [No. Transaksi]

Pembayaran resmi dilakukan hanya melalui rekening biro atas nama ${AGENCY_PROFILE.bankAccounts[0]?.a_n || 'SONO SUGIARTO'}.
Kwitansi resmi akan langsung kami kirimkan setiap kali pembayaran tercatat di sistem pembukuan kami.

Semoga Allah SWT memudahkan langkah dan niat suci Bapak/Ibu untuk beribadah di Tanah Suci Makkah dan Madinah.

Wassalamu'alaikum Wr. Wb.
${AGENCY_PROFILE.name}`
      );
    }
  };

  // Trigger Confirmation Modal for Sending Email
  const handleStartSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim()) {
      setErrorBanner('Alamat email tujuan tidak boleh kosong.');
      return;
    }
    setErrorBanner(null);
    setConfirmSendOpen(true);
  };

  // Perform actual sending after user confirms
  const handleConfirmSend = async () => {
    setIsSending(true);
    setErrorBanner(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Token akses tidak ditemukan. Silakan masuk kembali.');

      const payload: SendEmailPayload = {
        to: composeTo.trim(),
        subject: composeSubject.trim() || '(Tanpa Judul)',
        bodyText: composeBody,
      };

      await sendGmailEmail(token, payload);
      setConfirmSendOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setSelectedTemplate('');
      setActiveSubTab('sent');
      showToast(`Email berhasil dikirim ke ${payload.to}`);
      loadMessages('sent');
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal mengirim email.');
      setConfirmSendOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  // Trigger Confirmation Modal for Trashing Message
  const handleConfirmTrash = async () => {
    if (!messageToTrash) return;
    setIsTrashing(true);
    setErrorBanner(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Token akses tidak ditemukan.');

      await trashGmailMessage(token, messageToTrash.id);
      showToast('Email telah dipindahkan ke folder Sampah (Trash).');
      setMessageToTrash(null);
      setSelectedMessage(null);
      loadMessages();
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal menghapus email.');
      setMessageToTrash(null);
    } finally {
      setIsTrashing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-emerald-700 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
              <Mail className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Gmail & Komunikasi Jamaah
                </h2>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded uppercase">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Kirim tanda terima kwitansi, pengumuman manasik, dan pantau email masuk langsung dari akun Gmail resmi biro.
              </p>
            </div>
          </div>

          {/* User Status / Action */}
          {currentUser ? (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/20">
              <div className="text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentUser.displayName || 'Akun Gmail Terhubung'}</span>
                </div>
                <div className="text-[11px] text-blue-200 font-mono">
                  {currentUser.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar dari akun Google"
                className="p-2 rounded-lg bg-white/10 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer text-blue-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <GoogleSignInButton
              onClick={handleLogin}
              isLoading={isLoggingIn}
              text="Hubungkan Akun Gmail"
            />
          )}
        </div>

        {/* Global Error Banner */}
        {errorBanner && (
          <div className="m-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Unauthenticated State Explanation */}
        {!currentUser ? (
          <div className="p-8 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Integrasi Gmail Madani Tour Tegal
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dengan izin Anda, aplikasi ini dapat mengakses Google Workspace untuk membaca pesan, mengirimkan kwitansi pembayaran elektronik, dan memberikan konfirmasi keberangkatan umroh langsung kepada jamaah.
            </p>
            <div className="pt-2 flex justify-center">
              <GoogleSignInButton
                onClick={handleLogin}
                isLoading={isLoggingIn}
                text="Masuk dengan Akun Google / Gmail"
              />
            </div>
            <div className="text-xs text-slate-400">
              Token akses disimpan secara aman dalam memori aplikasi dan tidak pernah disimpan dalam local storage.
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Tabs */
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
              {/* Sub navigation buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveSubTab('inbox');
                    setSelectedMessage(null);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'inbox'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Kotak Masuk (Inbox)</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSubTab('sent');
                    setSelectedMessage(null);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'sent'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Terkirim (Sent)</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSubTab('compose');
                    setSelectedMessage(null);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'compose'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tulis Email Baru</span>
                </button>
              </div>

              {/* Refresh & Search */}
              {activeSubTab !== 'compose' && (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari email (jamaah, subjek)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') loadMessages(activeSubTab);
                      }}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => loadMessages(activeSubTab)}
                    disabled={isLoadingMessages}
                    title="Segarkan data email"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Sub-tab 1 & 2: Inbox & Sent Email List / Details */}
            {(activeSubTab === 'inbox' || activeSubTab === 'sent') && (
              <div className="mt-5">
                {selectedMessage ? (
                  /* Message Detail Viewer */
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in duration-150">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke daftar</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setComposeTo(selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from);
                            setComposeSubject(`Re: ${selectedMessage.subject}`);
                            setComposeBody(`\n\n--- Pesan Asli ---\n${selectedMessage.bodyText || ''}`);
                            setActiveSubTab('compose');
                            setSelectedMessage(null);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Balas</span>
                        </button>
                        <button
                          onClick={() => setMessageToTrash(selectedMessage)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold border border-rose-200 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {selectedMessage.subject}
                        </h3>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mt-2 pb-3 border-b border-slate-100">
                          <div>
                            <span className="font-semibold text-slate-700">Dari: </span>
                            <span>{selectedMessage.from}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Kepada: </span>
                            <span>{selectedMessage.to}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{selectedMessage.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Email Body Rendering */}
                      <div className="pt-2">
                        {selectedMessage.bodyHtml ? (
                          <div
                            className="text-xs sm:text-sm text-slate-800 leading-relaxed overflow-x-auto bg-slate-50/50 p-4 rounded-xl border border-slate-100"
                            dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                          />
                        ) : (
                          <pre className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {selectedMessage.bodyText || selectedMessage.snippet}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Messages Table List */
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                    {isLoadingMessages ? (
                      <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Memuat email dari Google...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-xs">
                        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-slate-600">Tidak ada pesan ditemukan.</p>
                        <p className="mt-1">Kotak pesan kosong atau tidak ada email yang cocok dengan pencarian.</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => setSelectedMessage(msg)}
                          className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {activeSubTab === 'sent' ? `Ke: ${msg.to}` : msg.from}
                              </span>
                              <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                                {msg.date ? new Date(msg.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-800 truncate mt-0.5 group-hover:text-blue-700">
                              {msg.subject}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {msg.snippet}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0" />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 3: Compose New Email */}
            {activeSubTab === 'compose' && (
              <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-3xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      Tulis Email Baru (Akun Madani Tour)
                    </h3>
                  </div>

                  {/* Prebuilt Templates Selector */}
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleApplyTemplate(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Pilih Template Pesan --</option>
                      <option value="manasik">Jadwal Manasik & Titik Kumpul</option>
                      <option value="dokumen">Pengingat Paspor & Dokumen</option>
                      <option value="konfirmasi">Konfirmasi Pendaftaran Paket</option>
                    </select>
                  </div>
                </div>

                <form onSubmit={handleStartSend} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kepada (Alamat Email) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contoh: jamaah.tegal@gmail.com"
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subjek Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Subjek email..."
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Isi Pesan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={12}
                      placeholder="Tulis pesan lengkap kepada jamaah..."
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">
                      Email akan dikirimkan dari akun: <strong className="font-mono text-slate-700">{currentUser.email}</strong>
                    </span>

                    <button
                      type="submit"
                      disabled={isSending || !composeTo.trim()}
                      className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Email</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal: Send Email (Required by Workspace Integration Skill) */}
      <ConfirmationModal
        isOpen={confirmSendOpen}
        onClose={() => setConfirmSendOpen(false)}
        onConfirm={handleConfirmSend}
        isLoading={isSending}
        title="Konfirmasi Pengiriman Email"
        description="Apakah Anda yakin ingin mengirim email ini sekarang? Email akan langsung terkirim atas nama akun Gmail biro Anda."
        confirmLabel="Ya, Kirim Email"
        cancelLabel="Batal / Periksa Kembali"
        details={[
          { label: 'Penerima', value: composeTo },
          { label: 'Subjek', value: composeSubject },
          { label: 'Pengirim', value: currentUser?.email || '' },
        ]}
      />

      {/* Confirmation Modal: Trash Email (Required by Workspace Integration Skill) */}
      <ConfirmationModal
        isOpen={!!messageToTrash}
        onClose={() => setMessageToTrash(null)}
        onConfirm={handleConfirmTrash}
        isLoading={isTrashing}
        variant="danger"
        title="Konfirmasi Pindahkan ke Sampah"
        description="Apakah Anda yakin ingin memindahkan pesan email ini ke folder Sampah (Trash)? Pesan tidak akan muncul lagi di kotak masuk Anda."
        confirmLabel="Ya, Pindahkan ke Sampah"
        cancelLabel="Batal"
        details={
          messageToTrash
            ? [
                { label: 'Subjek', value: messageToTrash.subject },
                { label: 'Dari', value: messageToTrash.from },
              ]
            : []
        }
      />
    </div>
  );
};
