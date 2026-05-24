// api/pledge.js — record a prayer-hour pledge with optional Hour Companion destination
import { sql } from '../lib/db.js';
import { notify, sendEmail, row } from '../lib/email.js';
import { str, email, isoDate } from '../lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  const name       = str(body.name, { max: 120 });
  const userEmail  = body.email ? email(body.email) : null;
  const pledgeTime = isoDate(body.time);
  const intention  = body.intention ? str(body.intention, { max: 1000 }) : null;

  // Optional Hour Companion destination
  let destType = null;
  let destId   = null;
  let destName = null;
  let destUrl  = null;
  if (body.destination_type === 'chapel' || body.destination_type === 'stream') {
    destType = body.destination_type;
    if (destType === 'chapel') {
      // Chapel id required; the rest is looked up server-side from the chapels table
      const id = parseInt(body.destination_id, 10);
      if (Number.isInteger(id) && id > 0) {
        try {
          const { rows } = await sql`SELECT id, name, city, country, lat, lng FROM chapels WHERE id = ${id} AND status = 'approved'`;
          if (rows && rows[0]) {
            destId   = rows[0].id;
            destName = `${rows[0].name} — ${rows[0].city}, ${rows[0].country}`;
            destUrl  = `https://www.google.com/maps?q=${rows[0].lat},${rows[0].lng}`;
          } else {
            destType = null; // chapel not found — drop the destination entirely
          }
        } catch (e) {
          console.error('[pledge] chapel lookup failed:', e);
          destType = null;
        }
      } else {
        destType = null;
      }
    } else {
      // Stream: name + url are sent by the client (curated whitelist on the frontend)
      destName = str(body.destination_name, { max: 200 });
      destUrl  = str(body.destination_url,  { max: 500 });
      if (!destName || !destUrl) destType = null;
    }
  }

  if (!name || !pledgeTime) {
    return res.status(400).json({ error: 'Missing required fields: name, time' });
  }

  try {
    await sql`
      INSERT INTO pledges (name, email, pledge_time, intention,
                           destination_type, destination_id, destination_name, destination_url)
      VALUES (${name}, ${userEmail}, ${pledgeTime}, ${intention},
              ${destType}, ${destId}, ${destName}, ${destUrl})
    `;

    const pledgeDate = new Date(pledgeTime);
    const formattedTime = pledgeDate.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });

    const escapeHtml = s => String(s || '').replace(/[<>&]/g, c => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;',
    }[c]));

    // Render the Hour Companion block (admin + user emails) — only if destination set
    const companionLineAdmin = destType
      ? row('Praying at', destType === 'chapel' ? `${destName} (chapel)` : `${destName} (live stream)`)
      : '';

    const companionBlockUser = destType
      ? `
        <div style="background:#fbf6e9;border-left:3px solid #b8923a;padding:16px 20px;margin:24px 0;">
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-bottom:6px;">
            ${destType === 'chapel' ? 'Where You Will Pray' : 'Where You Will Watch'}
          </div>
          <div style="font-size:17px;margin-bottom:8px;">${escapeHtml(destName)}</div>
          <a href="${escapeHtml(destUrl)}" style="font-family:'Inter',sans-serif;font-size:12px;letter-spacing:0.1em;color:#7a5f1f;text-decoration:none;border-bottom:1px solid #b8923a;padding-bottom:1px;">
            ${destType === 'chapel' ? 'OPEN IN MAPS' : 'OPEN STREAM'} →
          </a>
        </div>
      `
      : '';

    // Notify admin (don't block the response)
    notify({
      subject: `🕯️ New pledge from ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;">
          <h2 style="color:#7a5f1f;border-bottom:2px solid #b8923a;padding-bottom:8px;">New Hour Pledged</h2>
          <table style="border-collapse:collapse;width:100%;">
            ${row('Name', name)}
            ${row('Email', userEmail || '(not provided)')}
            ${row('Pledge Time', formattedTime)}
            ${row('Intention', intention || '(none)')}
            ${companionLineAdmin}
          </table>
        </div>
      `,
    }).catch(e => console.error('[pledge] admin notify failed:', e));

    // Send confirmation to the pledger (if they gave an email)
    if (userEmail) {
      sendEmail({
        to: userEmail,
        subject: 'Your hour of Adoration is pledged',
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;color:#25262a;line-height:1.7;">
            <div style="text-align:center;padding:20px 0;border-bottom:1px solid #d4a83a;">
              <div style="font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.2em;color:#7a5f1f;text-transform:uppercase;margin-bottom:8px;">Would You Join Me for One Hour?</div>
              <div style="font-size:24px;color:#b8923a;">✦</div>
            </div>

            <p style="font-size:17px;margin-top:24px;">Dear ${escapeHtml(name)},</p>

            <p>Thank you for pledging an hour of prayer before the Blessed Sacrament. Your commitment has been recorded.</p>

            <div style="background:#fbf6e9;border-left:3px solid #b8923a;padding:16px 20px;margin:24px 0;">
              <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-bottom:6px;">Your Pledge Time</div>
              <div style="font-size:18px;font-style:italic;">${escapeHtml(formattedTime)}</div>
              ${intention ? `
                <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-top:14px;margin-bottom:6px;">Your Intention</div>
                <div style="font-style:italic;">${escapeHtml(intention)}</div>
              ` : ''}
            </div>

            ${companionBlockUser}

            <p><em>"Could you not watch with me one hour?"</em> — Matthew 26:40</p>

            <p>At your appointed time, you join thousands of adorers around the world before the Blessed Sacrament.</p>

            <p style="margin-top:32px;font-style:italic;color:#50525a;">In Christ,<br/>Would You Join Me for One Hour?</p>

            <div style="text-align:center;border-top:1px solid #d4d6da;padding-top:16px;margin-top:32px;font-size:13px;color:#8a8d96;">
              <a href="https://wouldyoujoinmeforonehour.org" style="color:#7a5f1f;text-decoration:none;">wouldyoujoinmeforonehour.org</a><br/>
              <span style="font-style:italic;">Ad Majorem Dei Gloriam</span>
            </div>
          </div>
        `,
      }).catch(e => console.error('[pledge] confirmation email failed:', e));
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[pledge] error:', err);
    return res.status(500).json({ error: 'Failed to record pledge' });
  }
}
