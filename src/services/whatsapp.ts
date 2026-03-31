import { Linking } from 'react-native';

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

  const clean = phone.replace(/\D/g, '');
  const cc = clean.startsWith('91') ? clean : `91${clean}`;
  const waUrl = `whatsapp://send?phone=${cc}&text=${encodeURIComponent(message)}`;

  const canOpen = await Linking.canOpenURL(waUrl);
  if (!canOpen) {
    // Fallback to SMS
    await Linking.openURL(`sms:${phone}?body=${encodeURIComponent(message)}`);
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
    const clean = m.phone.replace(/\D/g, '');
    const cc = clean.startsWith('91') ? clean : `91${clean}`;
    await Linking.openURL(`whatsapp://send?phone=${cc}&text=${encodeURIComponent(message)}`);
    await new Promise(r => setTimeout(r, 600));
  }
}
