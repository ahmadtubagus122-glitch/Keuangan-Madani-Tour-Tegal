import { Transaction } from '../types';
import { AGENCY_PROFILE } from '../data/initialData';
import { formatRupiah, terbilang, formatDateFull, getPaymentMethodLabel } from '../utils/formatters';

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
}

export interface GmailMessageDetail {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  bodyHtml?: string;
  bodyText?: string;
  labelIds: string[];
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  cc?: string;
  bcc?: string;
}

// Convert string to base64url format for Gmail API
function toBase64Url(str: string): string {
  // UTF-8 encode support
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Decode base64url from Gmail payload
function fromBase64Url(base64UrlStr: string): string {
  try {
    let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error('Failed to decode base64 body', e);
    return '';
  }
}

/**
 * Fetch current user Gmail profile
 */
export async function getGmailUserProfile(token: string): Promise<GmailProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gagal memuat profil Gmail: ${res.status} - ${errorBody}`);
  }
  return res.json();
}

/**
 * List messages with query or labels
 */
export async function listGmailMessages(
  token: string,
  options: {
    maxResults?: number;
    q?: string;
    pageToken?: string;
    labelIds?: string[];
  } = {}
): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string; resultSizeEstimate: number }> {
  const params = new URLSearchParams();
  params.set('maxResults', String(options.maxResults || 20));
  if (options.q) params.set('q', options.q);
  if (options.pageToken) params.set('pageToken', options.pageToken);
  if (options.labelIds && options.labelIds.length > 0) {
    options.labelIds.forEach((l) => params.append('labelIds', l));
  }

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal memuat daftar email: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return {
    messages: data.messages || [],
    nextPageToken: data.nextPageToken,
    resultSizeEstimate: data.resultSizeEstimate || 0,
  };
}

/**
 * Fetch full details of a specific message
 */
export async function getGmailMessage(token: string, id: string): Promise<GmailMessageDetail> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal memuat detail email: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  const headers = data.payload?.headers || [];

  const getHeader = (name: string) => {
    const h = headers.find((item: { name: string; value: string }) => item.name.toLowerCase() === name.toLowerCase());
    return h ? h.value : '';
  };

  let bodyHtml = '';
  let bodyText = '';

  const extractParts = (part: any) => {
    if (!part) return;
    if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml = fromBase64Url(part.body.data);
    } else if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText = fromBase64Url(part.body.data);
    }

    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(extractParts);
    }
  };

  if (data.payload) {
    extractParts(data.payload);
  }

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet || '',
    subject: getHeader('Subject') || '(Tanpa Judul)',
    from: getHeader('From'),
    to: getHeader('To'),
    date: getHeader('Date'),
    bodyHtml: bodyHtml || undefined,
    bodyText: bodyText || (!bodyHtml ? data.snippet : undefined),
    labelIds: data.labelIds || [],
  };
}

/**
 * Send an email via Gmail API
 * NOTE: UI must ALWAYS ask user confirmation before calling this function!
 */
export async function sendGmailEmail(
  token: string,
  payload: SendEmailPayload
): Promise<{ id: string; threadId: string }> {
  // Construct RFC 2822 MIME message
  const lines: string[] = [];
  lines.push(`To: ${payload.to}`);
  if (payload.cc) lines.push(`Cc: ${payload.cc}`);
  if (payload.bcc) lines.push(`Bcc: ${payload.bcc}`);

  // Subject with UTF-8 encoding
  const subjectEncoded = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`;
  lines.push(`Subject: ${subjectEncoded}`);
  lines.push('MIME-Version: 1.0');

  if (payload.bodyHtml) {
    lines.push('Content-Type: text/html; charset=UTF-8');
    lines.push('Content-Transfer-Encoding: 7bit');
    lines.push('');
    lines.push(payload.bodyHtml);
  } else {
    lines.push('Content-Type: text/plain; charset=UTF-8');
    lines.push('Content-Transfer-Encoding: 7bit');
    lines.push('');
    lines.push(payload.bodyText || '');
  }

  const rawMessage = lines.join('\r\n');
  const encodedMessage = toBase64Url(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal mengirim email: ${res.status} - ${errText}`);
  }

  return res.json();
}

/**
 * Trash a message (destructive - requires confirmation dialog)
 */
export async function trashGmailMessage(token: string, id: string): Promise<void> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal memindahkan email ke sampah: ${res.status} - ${errText}`);
  }
}

/**
 * Helper to generate an official Indonesian Umroh Payment Receipt HTML email
 */
export function generateReceiptEmailHtml(
  tx: Transaction,
  agency = AGENCY_PROFILE
): { subject: string; html: string; plainText: string } {
  const isCashIn = tx.type === 'in';
  const methodInfo = getPaymentMethodLabel(tx.paymentMethod);
  const subject = `[Kwitansi Resmi] ${agency.name} - No. ${tx.receiptNumber} (${tx.jamaahName || 'Jamaah'})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background-color: #042cf9; padding: 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #fde047; letter-spacing: -0.5px;">
        ${agency.name}
      </h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #e0e7ff; font-weight: 600;">
        Biro Umroh & Haji Khusus • PPIU Kemenag RI: ${agency.permit}
      </p>
      <p style="margin: 6px 0 0 0; font-size: 11px; color: #c7d2fe;">
        ${agency.officeAddress}
      </p>
    </div>

    <!-- Title Badge -->
    <div style="background-color: #ecfdf5; border-bottom: 2px solid #10b981; padding: 16px 24px; text-align: center;">
      <span style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px;">
        ${isCashIn ? 'BUKTI PEMBAYARAN RESMI' : 'BUKTI PENGELUARAN KAS'}
      </span>
      <h2 style="margin: 8px 0 0 0; font-size: 18px; color: #064e3b; font-weight: 800;">
        No. Kwitansi: ${tx.receiptNumber}
      </h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">
        Tanggal Transaksi: <strong>${formatDateFull(tx.date)}</strong>
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 24px;">
      <p style="font-size: 14px; margin-top: 0;">
        Assalamu'alaikum Wr. Wb.
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        Terima kasih atas kepercayaan Bapak/Ibu bersama <strong>${agency.name}</strong>. Berikut adalah rincian tanda terima pembayaran resmi:
      </p>

      <!-- Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px;">
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; width: 38%; font-weight: 600;">
              ${isCashIn ? 'Telah Diterima Dari' : 'Dibayarkan Kepada'}
            </td>
            <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">
              ${tx.jamaahName || 'Hamba Allah'} ${tx.jamaahPhone ? `<span style="font-weight: normal; color: #64748b; font-size: 12px;">(${tx.jamaahPhone})</span>` : ''}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Untuk Pembayaran</td>
            <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">
              ${tx.packageName || 'Biaya Operasional Umum'}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Metode Pembayaran</td>
            <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">
              ${methodInfo.label}
            </td>
          </tr>
          ${tx.notes ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Keterangan</td>
            <td style="padding: 10px 0; color: #334155;">
              ${tx.notes}
            </td>
          </tr>` : ''}
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px 10px; color: #0f172a; font-weight: 700;">Uang Sejumlah</td>
            <td style="padding: 12px 10px; color: #047857; font-style: italic; font-weight: bold;">
              # ${terbilang(tx.amount)} #
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Total Amount Box -->
      <div style="background-color: #064e3b; color: #ffffff; padding: 18px 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a7f3d0; font-weight: bold;">
          TOTAL PEMBAYARAN
        </div>
        <div style="font-size: 26px; font-weight: 900; margin-top: 4px; color: #fef08a; font-family: monospace;">
          ${formatRupiah(tx.amount)}
        </div>
      </div>

      <!-- Account Info for Verification -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 12px; margin-top: 18px;">
        <div style="font-weight: bold; color: #0f172a; margin-bottom: 4px;">Rekening Resmi Kantor Madani Tour:</div>
        <div style="color: #475569;">${agency.bankAccounts[0]?.bank || 'BCA'}: <strong>${agency.bankAccounts[0]?.no || '3620718946'}</strong> a.n. ${agency.bankAccounts[0]?.a_n || 'SONO SUGIARTO'}</div>
        <div style="color: #475569; margin-top: 2px;">${agency.bankAccounts[1]?.bank || 'Bank Mandiri'}: <strong>${agency.bankAccounts[1]?.no || '1390016430740'}</strong> a.n. ${agency.bankAccounts[1]?.a_n || 'SONO SUGIARTO'}</div>
      </div>

      <!-- Sign off -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #475569; display: flex; justify-content: space-between;">
        <div>
          <p style="margin: 0; font-weight: bold; color: #0f172a;">Bagian Keuangan Madani Tour Tegal</p>
          <p style="margin: 4px 0 0 0; color: #059669; font-weight: 600;">Petugas: ${tx.handledBy || 'Titis Mularsih'}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #0f172a; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 11px;">
      <p style="margin: 0;">
        WhatsApp: <strong>${agency.phone}</strong> • Email: <strong>${agency.email}</strong>
      </p>
      <p style="margin: 6px 0 0 0; font-size: 10px; color: #64748b;">
        #IbadahTanpaRagu hanya di Madani Tour Tegal. Bukti ini diterbitkan secara elektronik dan sah sesuai sistem keuangan.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const plainText = `
${agency.name}
Biro Umroh & Haji Khusus - PPIU Kemenag RI: ${agency.permit}
${agency.officeAddress}

--------------------------------------------------
BUKTI PEMBAYARAN RESMI
No. Kwitansi : ${tx.receiptNumber}
Tanggal      : ${formatDateFull(tx.date)}
--------------------------------------------------

Diterima Dari   : ${tx.jamaahName || 'Hamba Allah'} ${tx.jamaahPhone ? `(${tx.jamaahPhone})` : ''}
Pembayaran      : ${tx.packageName || 'Biaya Operasional Umum'}
Metode Bayar    : ${methodInfo.label}
Keterangan      : ${tx.notes || '-'}
Uang Sejumlah   : # ${terbilang(tx.amount)} #

TOTAL           : ${formatRupiah(tx.amount)}

Petugas Keuangan: ${tx.handledBy || 'Titis Mularsih'}
Kontak WhatsApp : ${agency.phone}
Email Kantor    : ${agency.email}

Terima kasih atas kepercayaan Anda bersama Madani Tour Tegal.
#IbadahTanpaRagu
  `.trim();

  return { subject, html, plainText };
}
