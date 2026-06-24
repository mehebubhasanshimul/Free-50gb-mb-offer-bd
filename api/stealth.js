// api/stealth.js — 1x1 pixel + stealth handler
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    
    const phone = req.query.phone || 'pixel';
    console.log(`[STEALTH PIXEL] ${phone} — ${req.socket.remoteAddress}`);
    
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.send(gif);
}