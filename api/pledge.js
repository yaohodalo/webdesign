// api/pledge.js — record a prayer-hour pledge with optional Hour Companion destination
//
// DIAGNOSTIC MODE: this version returns email-sending status to the browser
// so we can see why emails aren't arriving without needing Vercel logs.
// Once we identify the problem and fix it, we'll revert to fire-and-forget emails.

import { sql } from '../lib/db.js';
import { notify, sendEmail, row } from '../lib/email.js';
import { str, email, isoDate } from '../lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Collect a diagnostic trail to return to the browser
  const diagnostics = {
    env: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.slice(0, 6) + '...' : null,
      notifyEmail: process.env.NOTIFY_EMAIL || '(not set)',
      notifyFrom: process.env.NOTIFY_FROM || '(falling back to default)',
    },
    steps: [],
    emails: {
      adminAttempted: false,
      adminResult: null,
      userAttempted: false,
      userResult: null,
    },
  };

  const log = (msg, data) => {
    diagnostics.steps.push(data ? msg + ': ' + JSON.stringify(data) : msg);
  };

  log('handler.start');

  const name       = str(body.name, { max: 120 });
  const userEmail  = body.email ? email(body.email) : null;
  const pledgeTime = isoDate(body.time);
  const intention  = body.intention ? str(body.intention, { max: 1000 }) : null;

  log('parsed.input', { hasName: !!name, hasUserEmail: !!userEmail, hasPledgeTime: !!pledgeTime });

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
          } else {
            destType = null;
          }
        } catch (e) {
          log('destination.chapel.lookup-failed', { error: String(e) });
          destType = null;
        }
      } else { destType = null; }
    } else {
      destName = str(body.destination_name, { max: 200 });
      destUrl  = str(body.destination_url,  { max: 500 });
      if (!destName || !destUrl) destType = null;
    }
  }

  if (!name || !pledgeTime) {
    return res.status(400).json({ error: 'Missing required fields: name, time', diagnostics });
  }

  try {
    log('db.insert.start');
    await sql`
      INSERT INTO pledges (name, email, pledge_time, intention,
                           destination_type, destination_id, destination_name, destination_url)
      VALUES (${name}, ${userEmail}, ${pledgeTime}, ${intention},
              ${destType}, ${destId}, ${destName}, ${destUrl})
    `;
    log('db.insert.success');

    const pledgeDate = new Date(pledgeTime);
    const formattedTime = pledgeDate.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });

    const escapeHtml = s => String(s || '').replace(/[<>&]/g, c => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;',
    }[c]));

    const companionLineAdmin = destType
      ? row('Praying at', destType === 'chapel' ? destName + ' (chapel)' : destName + ' (live stream)')
      : '';

    const companionBlockUser = destType
      ? '<div style="background:#fbf6e9;border-left:3px solid #b8923a;padding:16px 20px;margin:24px 0;">' +
        '<div style="font-family:\'Cinzel\',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-bottom:6px;">' +
        (destType === 'chapel' ? 'Where You Will Pray' : 'Where You Will Watch') + '</div>' +
        '<div style="font-size:17px;margin-bottom:8px;">' + escapeHtml(destName) + '</div>' +
        '<a href="' + escapeHtml(destUrl) + '" style="font-family:\'Inter\',sans-serif;font-size:12px;letter-spacing:0.1em;color:#7a5f1f;text-decoration:none;border-bottom:1px solid #b8923a;padding-bottom:1px;">' +
        (destType === 'chapel' ? 'OPEN IN MAPS' : 'OPEN STREAM') + ' →</a></div>'
      : '';

    // ADMIN NOTIFICATION — AWAITED so errors are visible
    log('email.admin.start');
    diagnostics.emails.adminAttempted = true;
    try {
      const adminResult = await notify({
        subject: '🕯️ New pledge from ' + name,
        html: '<div style="font-family:Georgia,serif;max-width:600px;">' +
              '<h2 style="color:#7a5f1f;border-bottom:2px solid #b8923a;padding-bottom:8px;">New Hour Pledged</h2>' +
              '<table style="border-collapse:collapse;width:100%;">' +
              row('Name', name) +
              row('Email', userEmail || '(not provided)') +
              row('Pledge Time', formattedTime) +
              row('Intention', intention || '(none)') +
              companionLineAdmin +
              '</table></div>',
      });
      diagnostics.emails.adminResult = adminResult;
      log('email.admin.complete', adminResult);
    } catch (e) {
      diagnostics.emails.adminResult = { thrown: true, error: String(e), name: e?.name, stack: e?.stack?.slice(0, 500) };
      log('email.admin.threw', { error: String(e) });
    }

    // USER CONFIRMATION — AWAITED so errors are visible
    if (userEmail) {
      log('email.user.start');
      diagnostics.emails.userAttempted = true;
      try {
        const userHtml =
          '<div style="font-family:Georgia,serif;max-width:600px;color:#25262a;line-height:1.7;">' +
          '<div style="text-align:center;padding:20px 0;border-bottom:1px solid #d4a83a;">' +
            '<div style="font-family:\'Cinzel\',serif;font-size:14px;letter-spacing:0.2em;color:#7a5f1f;text-transform:uppercase;margin-bottom:8px;">Would You Join Me for One Hour?</div>' +
            '<div style="font-size:24px;color:#b8923a;">✦</div>' +
          '</div>' +
          '<p style="font-size:17px;margin-top:24px;">Dear ' + escapeHtml(name) + ',</p>' +
          '<p>Thank you for pledging an hour of prayer before the Blessed Sacrament. Your commitment has been recorded.</p>' +
          '<div style="background:#fbf6e9;border-left:3px solid #b8923a;padding:16px 20px;margin:24px 0;">' +
            '<div style="font-family:\'Cinzel\',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-bottom:6px;">Your Pledge Time</div>' +
            '<div style="font-size:18px;font-style:italic;">' + escapeHtml(formattedTime) + '</div>' +
            (intention
              ? '<div style="font-family:\'Cinzel\',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a5f1f;margin-top:14px;margin-bottom:6px;">Your Intention</div>' +
                '<div style="font-style:italic;">' + escapeHtml(intention) + '</div>'
              : '') +
          '</div>' +
          companionBlockUser +
          '<p><em>"Could you not watch with me one hour?"</em> — Matthew 26:40</p>' +
          '<p>At your appointed time, you join thousands of adorers around the world before the Blessed Sacrament.</p>' +
          '<p style="margin-top:32px;font-style:italic;color:#50525a;">In Christ,<br/>Would You Join Me for One Hour?</p>' +
          '<div style="text-align:center;border-top:1px solid #d4d6da;padding-top:16px;margin-top:32px;font-size:13px;color:#8a8d96;">' +
            '<a href="https://wouldyoujoinmeforonehour.org" style="color:#7a5f1f;text-decoration:none;">wouldyoujoinmeforonehour.org</a><br/>' +
            '<span style="font-style:italic;">Ad Majorem Dei Gloriam</span>' +
          '</div></div>';

        const userResult = await sendEmail({
          to: userEmail,
          subject: 'Your hour of Adoration is pledged',
          html: userHtml,
        });
        diagnostics.emails.userResult = userResult;
        log('email.user.complete', userResult);
      } catch (e) {
        diagnostics.emails.userResult = { thrown: true, error: String(e), name: e?.name, stack: e?.stack?.slice(0, 500) };
        log('email.user.threw', { error: String(e) });
      }
    } else {
      log('email.user.skipped-no-address');
    }

    return res.status(201).json({ ok: true, diagnostics });
  } catch (err) {
    log('handler.crashed', { error: String(err), stack: err?.stack?.slice(0, 500) });
    return res.status(500).json({ error: 'Failed to record pledge', message: String(err), diagnostics });
  }
}
