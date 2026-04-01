import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { ContactWithBalance } from '@db/contacts';
import { Transaction } from '@db/transactions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtAmount(n: number) {
  return '₹' + Math.abs(n).toLocaleString('en-IN');
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function todayStr() {
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── All Contacts PDF ─────────────────────────────────────────────────────────

export async function exportAllContactsPDF(
  contacts: ContactWithBalance[],
  totalMilna: number,
  totalDena: number,
) {
  const net = totalMilna - totalDena;

  const rows = contacts.map((c) => {
    const bal = c.balance ?? 0;
    const color = bal > 0 ? '#16a34a' : bal < 0 ? '#dc2626' : '#6b7280';
    const label = bal > 0 ? 'Milna' : bal < 0 ? 'Dena' : 'Settled';
    return `
      <tr>
        <td>${c.name}</td>
        <td>${c.phone ?? '—'}</td>
        <td style="color:${color}; font-weight:600; text-align:right">${fmtAmount(bal)}</td>
        <td style="color:${color}; text-align:center">${label}</td>
      </tr>`;
  }).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .sub { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
      .summary { display: flex; gap: 24px; margin-bottom: 24px; }
      .summary-box { flex: 1; border-radius: 8px; padding: 16px; }
      .summary-box .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
      .summary-box .value { font-size: 20px; font-weight: bold; }
      .green-bg { background: #f0fdf4; }
      .red-bg { background: #fef2f2; }
      .blue-bg { background: #eff6ff; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
      td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
      tr:last-child td { border-bottom: none; }
      .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center; }
    </style>
  </head>
  <body>
    <h1>UdharBook — Contacts Summary</h1>
    <div class="sub">Generated on ${todayStr()} · ${contacts.length} contacts</div>

    <div class="summary">
      <div class="summary-box green-bg">
        <div class="label">Total Milna (Receivable)</div>
        <div class="value" style="color:#16a34a">${fmtAmount(totalMilna)}</div>
      </div>
      <div class="summary-box red-bg">
        <div class="label">Total Dena (Payable)</div>
        <div class="value" style="color:#dc2626">${fmtAmount(totalDena)}</div>
      </div>
      <div class="summary-box blue-bg">
        <div class="label">Net Balance</div>
        <div class="value" style="color:${net >= 0 ? '#1d4ed8' : '#dc2626'}">${net >= 0 ? '+' : ''}${fmtAmount(net)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th style="text-align:right">Amount</th>
          <th style="text-align:center">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="footer">UdharBook · Exported on ${todayStr()}</div>
  </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export Contacts PDF' });
}

// ─── All Contacts CSV ─────────────────────────────────────────────────────────

export async function exportAllContactsCSV(
  contacts: ContactWithBalance[],
) {
  const header = 'Name,Phone,Balance,Status\n';
  const rows = contacts.map((c) => {
    const bal = c.balance ?? 0;
    const status = bal > 0 ? 'Milna' : bal < 0 ? 'Dena' : 'Settled';
    const phone = c.phone ?? '';
    return `"${c.name}","${phone}",${bal},"${status}"`;
  }).join('\n');

  const csv = header + rows;
  const path = FileSystem.documentDirectory + `udharbook_contacts_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export Contacts CSV' });
}

// ─── Single Contact PDF ───────────────────────────────────────────────────────

export async function exportContactPDF(
  contactName: string,
  contactPhone: string | undefined,
  balance: number,
  transactions: Transaction[],
) {
  const rows = transactions.map((t) => {
    const isGave = t.type === 'gave';
    return `
      <tr>
        <td>${fmtDate(t.date)}</td>
        <td>${t.note ?? '—'}</td>
        <td style="color:${isGave ? '#dc2626' : '#16a34a'}; font-weight:600; text-align:right">
          ${isGave ? '-' : '+'}${fmtAmount(t.amount)}
        </td>
        <td style="text-align:center; color:${isGave ? '#dc2626' : '#16a34a'}">
          ${isGave ? 'Diya' : 'Mila'}
        </td>
      </tr>`;
  }).join('');

  const balColor = balance > 0 ? '#16a34a' : balance < 0 ? '#dc2626' : '#6b7280';
  const balLabel = balance > 0 ? 'Milna hai' : balance < 0 ? 'Dena hai' : 'Settled';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
      h1 { font-size: 22px; margin-bottom: 2px; }
      .sub { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
      .balance-box { border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: inline-block; }
      .balance-label { font-size: 12px; color: #6b7280; }
      .balance-value { font-size: 28px; font-weight: bold; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
      td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
      tr:last-child td { border-bottom: none; }
      .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center; }
    </style>
  </head>
  <body>
    <h1>${contactName}</h1>
    <div class="sub">${contactPhone ?? 'No phone'} · ${transactions.length} transactions · ${todayStr()}</div>

    <div class="balance-box" style="background:${balance >= 0 ? '#f0fdf4' : '#fef2f2'}">
      <div class="balance-label">Net Balance</div>
      <div class="balance-value" style="color:${balColor}">${fmtAmount(balance)} <span style="font-size:14px; font-weight:400">${balLabel}</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Note</th>
          <th style="text-align:right">Amount</th>
          <th style="text-align:center">Type</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="footer">UdharBook · Exported on ${todayStr()}</div>
  </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `${contactName} — Transactions` });
}

// ─── Single Contact CSV ───────────────────────────────────────────────────────

export async function exportContactCSV(
  contactName: string,
  transactions: Transaction[],
) {
  const header = 'Date,Note,Amount,Type\n';
  const rows = transactions.map((t) => {
    const sign = t.type === 'gave' ? -1 : 1;
    return `"${fmtDate(t.date)}","${t.note ?? ''}",${sign * t.amount},"${t.type === 'gave' ? 'Diya' : 'Mila'}"`;
  }).join('\n');

  const csv = header + rows;
  const safeName = contactName.replace(/[^a-z0-9]/gi, '_');
  const path = FileSystem.documentDirectory + `udharbook_${safeName}_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: `${contactName} — Export CSV` });
}
