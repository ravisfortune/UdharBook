import { Linking, Platform } from 'react-native';

/** Normalise any phone string to a WhatsApp-ready number with country code. */
function toWhatsAppNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    // Plain 10-digit Indian number → add 91
    return `91${clean}`;
  }
  if (clean.length === 12 && clean.startsWith('91')) {
    // Already has Indian CC (e.g. 919876543210)
    return clean;
  }
  if (clean.length === 11 && clean.startsWith('0')) {
    // Trunk prefix format: 09876543210 → 919876543210
    return `91${clean.slice(1)}`;
  }
  // International or already fully formatted — use as-is
  return clean;
}

export async function sendWhatsAppReminder(
  phone: string,
  name: string,
  amount: number,
  lang: 'hi' | 'en' = 'hi'
) {
  const amt = Math.abs(amount).toLocaleString('en-IN');
  const message = lang === 'hi'
    ? `Bhai ${name}, mere paas tumhara ₹${amt} dena baaki hai. Convenient ho toh bata dena 🙏`
    : `Hey ${name}, you have a pending payment of ₹${amt}. Please settle when convenient 🙏`;

  const cc = toWhatsAppNumber(phone);
  const waUrl = `whatsapp://send?phone=${cc}&text=${encodeURIComponent(message)}`;

  const canOpen = await Linking.canOpenURL(waUrl);
  if (!canOpen) {
    // Fallback to SMS — iOS uses & separator, Android uses ?
    const smsSep = Platform.OS === 'ios' ? '&' : '?';
    await Linking.openURL(`sms:${phone}${smsSep}body=${encodeURIComponent(message)}`);
    return;
  }
  await Linking.openURL(waUrl);
}

export async function sendBulkSplitReminders(
  members: Array<{ phone?: string; name: string; amount: number }>,
  billTitle: string
) {
  for (const m of members) {
    if (!m.phone) continue;
    const amt = Math.abs(m.amount).toLocaleString('en-IN');
    const message = `${m.name}, "${billTitle}" mein tera share ₹${amt} baaki hai. Whenever possible 🙏`;
    const cc = toWhatsAppNumber(m.phone);
    await Linking.openURL(`whatsapp://send?phone=${cc}&text=${encodeURIComponent(message)}`);
    await new Promise(r => setTimeout(r, 600));
  }
}
