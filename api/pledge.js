// api/pledge.js — handles BOTH:
//   1. POST a new prayer-hour pledge (normal user submission)
//   2. POST with cron token: triggers reminder emails for pledges in the next ~24h
//
// We fold both into one file to stay within Vercel Hobby's 12-function limit.

import { sql } from '../lib/db.js';
import { notify, sendEmail, row } from '../lib/email.js';
import { str, email, isoDate } from '../lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ────────────────────────────────────────────────────────────────────────
  // CRON MODE — triggered by GitHub Actions with secret token
  // ────────────────────────────────────────────────────────────────────────
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === 'Bearer ' + cronSecret) {
    return handleCronReminders(req, res);
  }

  // ────────────────────────────────────────────────────────────────────────
  // NORMAL MODE — a user is pledging from the website
  // ────────────────────────────────────────────────────────────────────────
  return handlePledge(req, res);
}

// ═══════════════════════════════════════════════════════════════════════════
// NORMAL PLEDGE HANDLER
// ═══════════════════════════════════════════════════════════════════════════
async function handlePledge(req, res) {
  const body = req.body || {};
  const name       = str(body.name, { max: 120 });
  const userEmail  = body.email ? email(body.email) : null;
  const pledgeTime = isoDate(body.time);
  const intention  = body.intention ? str(body.intention, { max: 1000 }) : null;

  // Optional Hour Companion destination
  let destType = null, destId = null, destName = null, destUrl = null;
  if (body.destination_type === 'chapel' || body.destination_type === 'stream') {
    destType = body.destination_type;
    if (destType === 'chapel') {
      const id = parseInt(body.destination_id, 10);
      if (Number.isInteger(id) && id > 0) {
        try {
          const { rows } = await sql`SELECT id, name, city, country, lat, lng FROM chapels WHERE id = ${id} AND status = 'approved'`;
          if (rows && rows[0]) {
            destId   = rows[0].id;
            destName = rows[0].name + ' — ' + rows[0].city + ', ' + rows[0].country;
            destUrl  = 'https://www.google.com/maps?q=' + rows[0].lat + ',' + rows[0].lng;
          } else { destType = null; }
        } catch (e) { destType = null; }
      } else { destType = null; }
    } else {
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

    const formattedTime = formatPledgeTime(pledgeTime);
    const safeName = escapeHtml(name);

    // CRITICAL: must AWAIT these emails on Vercel serverless.
    // Without await, the function returns 201 immediately and Vercel kills
    // the execution before the email actually sends.
    // We wrap in try/catch so an email failure doesn't 500 the user's pledge.
    try {
      await notify({
        subject: '🕯️ New pledge from ' + name,
        html: '<div style="font-family:Georgia,serif;max-width:600px;">' +
              '<h2 style="color:#7a5f1f;border-bottom:2px solid #b8923a;padding-bottom:8px;">New Hour Pledged</h2>' +
              '<table style="border-collapse:collapse;width:100%;">' +
              row('Name', name) +
              row('Email', userEmail || '(not provided)') +
              row('Pledge Time', formattedTime) +
              row('Intention', intention || '(none)') +
              (destType ? row('Praying at', destType === 'chapel' ? destName + ' (chapel)' : destName + ' (live stream)') : '') +
              '</table></div>',
      });
    } catch (e) {
      console.error('[pledge] admin notify failed:', e);
    }

    // User confirmation (only if they provided an email)
    if (userEmail) {
      try {
        await sendEmail({
          to: userEmail,
          subject: 'Your hour of Adoration is pledged',
          html: buildUserConfirmationEmail({ name: safeName, formattedTime, intention, destType, destName, destUrl }),
        });
      } catch (e) {
        console.error('[pledge] user confirmation failed:', e);
      }
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[pledge] db insert failed:', err);
    return res.status(500).json({ error: 'Failed to record pledge' });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CRON REMINDER HANDLER — find pledges 23–25h from now and email reminders
// ═══════════════════════════════════════════════════════════════════════════
async function handleCronReminders(req, res) {
  console.log('[cron] reminders run started');

  try {
    // Find pledges that:
    //  - Have an email address (anonymous pledges get no reminder)
    //  - Are between 23 and 25 hours from now (2-hour window catches hourly cron exactly once)
    //  - Haven't been reminded yet
    const { rows: dueSoon } = await sql`
      SELECT id, name, email, pledge_time, intention,
             destination_type, destination_name, destination_url
      FROM pledges
      WHERE email IS NOT NULL
        AND email != ''
        AND reminder_sent_at IS NULL
        AND pledge_time > NOW() + INTERVAL '23 hours'
        AND pledge_time < NOW() + INTERVAL '25 hours'
      ORDER BY pledge_time ASC
      LIMIT 50
    `;

    console.log('[cron] found ' + dueSoon.length + ' pledges due for reminder');

    const results = [];
    for (const p of dueSoon) {
      try {
        const formattedTime = formatPledgeTime(p.pledge_time);
        const safeName = escapeHtml(p.name);

        const sendResult = await sendEmail({
          to: p.email,
          subject: 'A gentle reminder: your hour of Adoration begins tomorrow',
          html: buildReminderEmail({
            name: safeName,
            formattedTime,
            intention: p.intention,
            destType: p.destination_type,
            destName: p.destination_name,
            destUrl: p.destination_url,
          }),
        });

        if (sendResult.ok) {
          // Mark as reminded so we don't double-send
          await sql`UPDATE pledges SET reminder_sent_at = NOW() WHERE id = ${p.id}`;
          results.push({ id: p.id, status: 'sent' });
        } else {
          // Don't mark as sent if it failed — let it retry next hour
          results.push({ id: p.id, status: 'failed', error: sendResult });
        }
      } catch (err) {
        results.push({ id: p.id, status: 'error', error: String(err) });
      }
    }

    return res.status(200).json({
      ok: true,
      checked: dueSoon.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status !== 'sent').length,
      results,
    });
  } catch (err) {
    console.error('[cron] reminder run failed:', err);
    return res.status(500).json({ error: 'Cron run failed', message: String(err) });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function escapeHtml(s) {
  return String(s || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

function formatPledgeTime(pledgeTime) {
  const d = new Date(pledgeTime);
  return d.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function buildUserConfirmationEmail({ name, formattedTime, intention, destType, destName, destUrl }) {
  const companionBlock = destType
    ? '<div style="background:#fbf6e9;border-left:3px solid #b8923a;padding:16px 20px;margin:24px 0;">' +
      '<div style="font-family:\'Cinzel\',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-bottom:6px;">' +
      (destType === 'chapel' ? 'Where You Will Pray' : 'Where You Will Watch') + '</div>' +
      '<div style="font-size:17px;margin-bottom:8px;">' + escapeHtml(destName) + '</div>' +
      '<a href="' + escapeHtml(destUrl) + '" style="font-family:\'Inter\',sans-serif;font-size:12px;letter-spacing:0.1em;color:#7a5f1f;text-decoration:none;border-bottom:1px solid #b8923a;padding-bottom:1px;">' +
      (destType === 'chapel' ? 'OPEN IN MAPS' : 'OPEN STREAM') + ' →</a></div>'
    : '';

  return '<div style="font-family:Georgia,serif;max-width:600px;color:#25262a;line-height:1.7;">' +
    '<div style="text-align:center;padding:20px 0;border-bottom:1px solid #d4a83a;">' +
      '<div style="font-family:\'Cinzel\',serif;font-size:14px;letter-spacing:0.2em;color:#7a5f1f;text-transform:uppercase;margin-bottom:8px;">Would You Join Me for One Hour?</div>' +
      '<div style="font-size:24px;color:#b8923a;">✦</div>' +
    '</div>' +
    '<p style="font-size:17px;margin-top:24px;">Dear ' + name + ',</p>' +
    '<p>Thank you for pledging an hour of prayer before the Blessed Sacrament. Your commitment has been recorded.</p>' +
    '<div style="background:#fbf6e9;border-left:3px solid #b8923a;padding:16px 20px;margin:24px 0;">' +
      '<div style="font-family:\'Cinzel\',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-bottom:6px;">Your Pledge Time</div>' +
      '<div style="font-size:18px;font-style:italic;">' + escapeHtml(formattedTime) + '</div>' +
      (intention
        ? '<div style="font-family:\'Cinzel\',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-top:14px;margin-bottom:6px;">Your Intention</div>' +
          '<div style="font-style:italic;">' + escapeHtml(intention) + '</div>'
        : '') +
    '</div>' +
    companionBlock +
    '<p><em>"Could you not watch with me one hour?"</em> — Matthew 26:40</p>' +
    '<p>At your appointed time, you join thousands of adorers around the world before the Blessed Sacrament. We will send you a gentle reminder 24 hours before.</p>' +
    '<p style="margin-top:32px;font-style:italic;color:#50525a;">In Christ,<br/>Would You Join Me for One Hour?</p>' +
    '<div style="text-align:center;border-top:1px solid #d4d6da;padding-top:16px;margin-top:32px;font-size:13px;color:#8a8d96;">' +
      '<a href="https://wouldyoujoinmeforonehour.org" style="color:#7a5f1f;text-decoration:none;">wouldyoujoinmeforonehour.org</a><br/>' +
      '<span style="font-style:italic;">Ad Majorem Dei Gloriam</span>' +
    '</div></div>';
}

function buildReminderEmail({ name, formattedTime, intention, destType, destName, destUrl }) {
  const companionBlock = destType
    ? '<div style="background:#fbf6e9;border-left:3px solid #b8923a;padding:16px 20px;margin:24px 0;">' +
      '<div style="font-family:\'Cinzel\',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-bottom:6px;">' +
      (destType === 'chapel' ? 'Where You Will Pray' : 'Where You Will Watch') + '</div>' +
      '<div style="font-size:17px;margin-bottom:8px;">' + escapeHtml(destName) + '</div>' +
      '<a href="' + escapeHtml(destUrl) + '" style="font-family:\'Inter\',sans-serif;font-size:12px;letter-spacing:0.1em;color:#7a5f1f;text-decoration:none;border-bottom:1px solid #b8923a;padding-bottom:1px;">' +
      (destType === 'chapel' ? 'OPEN IN MAPS' : 'OPEN STREAM') + ' →</a></div>'
    : '';

  return '<div style="font-family:Georgia,serif;max-width:600px;color:#25262a;line-height:1.7;">' +
    '<div style="text-align:center;padding:20px 0;border-bottom:1px solid #d4a83a;">' +
      '<div style="font-family:\'Cinzel\',serif;font-size:14px;letter-spacing:0.2em;color:#7a5f1f;text-transform:uppercase;margin-bottom:8px;">A Gentle Reminder</div>' +
      '<div style="font-size:24px;color:#b8923a;">✦</div>' +
    '</div>' +
    '<p style="font-size:17px;margin-top:24px;">Dear ' + name + ',</p>' +
    '<p>This is a gentle reminder that your hour of Eucharistic Adoration begins in about <strong>24 hours</strong>.</p>' +
    '<div style="background:#fbf6e9;border-left:3px solid #b8923a;padding:16px 20px;margin:24px 0;">' +
      '<div style="font-family:\'Cinzel\',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-bottom:6px;">Your Pledged Time</div>' +
      '<div style="font-size:18px;font-style:italic;">' + escapeHtml(formattedTime) + '</div>' +
      (intention
        ? '<div style="font-family:\'Cinzel\',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-top:14px;margin-bottom:6px;">Your Intention</div>' +
          '<div style="font-style:italic;">' + escapeHtml(intention) + '</div>'
        : '') +
    '</div>' +
    companionBlock +
    '<p>Take a moment to prepare your heart. The Lord, who waits for you in the Blessed Sacrament, has counted on this hour.</p>' +
    '<p><em>"Could you not watch with me one hour?"</em> — Matthew 26:40</p>' +
    '<p>If you cannot make it, that is between you and the Lord — but know that He desires this time with you.</p>' +
    '<p style="margin-top:32px;font-style:italic;color:#50525a;">In Christ,<br/>Would You Join Me for One Hour?</p>' +
    '<div style="text-align:center;border-top:1px solid #d4d6da;padding-top:16px;margin-top:32px;font-size:13px;color:#8a8d96;">' +
      '<a href="https://wouldyoujoinmeforonehour.org" style="color:#7a5f1f;text-decoration:none;">wouldyoujoinmeforonehour.org</a><br/>' +
      '<span style="font-style:italic;">Ad Majorem Dei Gloriam</span>' +
    '</div></div>';
}
