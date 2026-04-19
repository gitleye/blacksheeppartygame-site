/**
 * Black Sheep Party Game — Contact Form Worker (AWS SES)
 *
 * Receives POST from /api/contact, validates the payload,
 * then sends an email via AWS SES to the team Google Group.
 *
 * Cloudflare secrets (set via wrangler CLI — never commit these):
 *   AWS_ACCESS_KEY_ID      — IAM user with ses:SendEmail permission
 *   AWS_SECRET_ACCESS_KEY  — IAM user secret
 *   AWS_REGION             — e.g. us-east-1 or eu-west-1
 *   TO_EMAIL               — your Google Group address
 *   FROM_EMAIL             — verified SES sender e.g. hello@blacksheeppartygame.com
 */

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const origin = request.headers.get('Origin') || '';
    const allowed = [
        'https://blacksheeppartygame.com',
        'https://www.blacksheeppartygame.com',
        'https://blacksheeppartygame-site.leye-oyelami.workers.dev',
        'https://blacksheeppartygame-site.black-sheep-games-account.workers.dev',
      ];
    if (!allowed.includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'Invalid request.' }, 400, request);
    }

    const { name, email, topic, message, _gotcha } = body;

    // Honeypot — silent discard if a bot filled in the hidden field
    if (_gotcha) return json({ ok: true }, 200, request);

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return json({ ok: false, error: 'Name, email, and message are required.' }, 422, request);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return json({ ok: false, error: 'Please enter a valid email address.' }, 422, request);
    }

    const topicLabels = {
      general: 'General question',
      order: 'Order / shipping',
      'card-idea': 'Card idea',
      wholesale: 'Wholesale',
      press: 'Press / partnership',
      other: 'Something else',
    };
    const topicLabel = topicLabels[topic] ?? 'General';
    const subject = `[Black Sheep] ${topicLabel} — ${name.trim()}`;

    try {
      await sendViaSes({
        env,
        to: env.TO_EMAIL,
        from: env.FROM_EMAIL,
        replyTo: email.trim(),
        subject,
        htmlBody: buildHtml(name.trim(), email.trim(), topicLabel, message.trim()),
        textBody: `From: ${name.trim()} <${email.trim()}>\nTopic: ${topicLabel}\n\n${message.trim()}`,
      });
    } catch (err) {
      console.error('SES error:', err.message);
      return json({ ok: false, error: 'Failed to send. Please try again.' }, 500, request);
    }

    return json({ ok: true }, 200, request);
  },
};

/* ─────────────────────────────────────────────
   AWS SES v2 HTTP API with Signature V4
   ───────────────────────────────────────────── */

async function sendViaSes({ env, to, from, replyTo, subject, htmlBody, textBody }) {
  const region = env.AWS_REGION;
  const endpoint = `https://email.${region}.amazonaws.com/v2/email/outbound-emails`;

  const payload = JSON.stringify({
    FromEmailAddress: from,
    Destination: { ToAddresses: [to] },
    ReplyToAddresses: [replyTo],
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: htmlBody, Charset: 'UTF-8' },
          Text: { Data: textBody, Charset: 'UTF-8' },
        },
      },
    },
  });

  // Build timestamps
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);

  const host = `email.${region}.amazonaws.com`;
  const signedHeaders = 'content-type;host;x-amz-date';
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const payloadHash = await sha256Hex(payload);

  const canonicalRequest = ['POST', '/v2/email/outbound-emails', '', canonicalHeaders, signedHeaders, payloadHash].join('\n');

  const credentialScope = `${dateStamp}/${region}/ses/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, await sha256Hex(canonicalRequest)].join('\n');

  const signingKey = await getSigningKey(env.AWS_SECRET_ACCESS_KEY, dateStamp, region, 'ses');
  const signature = await hmacHex(signingKey, stringToSign);

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${env.AWS_ACCESS_KEY_ID}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Host': host,
      'X-Amz-Date': amzDate,
      'Authorization': authHeader,
    },
    body: payload,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
}

/* ─── Crypto helpers (Web Crypto API — available in all Workers) ─── */

async function sha256Hex(data) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return bufToHex(buf);
}

async function hmacRaw(key, data) {
  const k = await crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? new TextEncoder().encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data));
}

async function hmacHex(key, data) {
  return bufToHex(await hmacRaw(key, data));
}

async function getSigningKey(secret, date, region, service) {
  const kDate    = await hmacRaw(`AWS4${secret}`, date);
  const kRegion  = await hmacRaw(kDate, region);
  const kService = await hmacRaw(kRegion, service);
  return hmacRaw(kService, 'aws4_request');
}

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ─── Response helpers ─── */

function corsHeaders(request) {
  return {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
}

function escHtml(s = '') {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildHtml(name, email, topic, message) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#0a0a0a;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="color:#00B4FF;font-size:22px;margin:0">New message — Black Sheep</h1>
  </div>
  <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;border:1px solid #eee">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:8px 0;color:#666;font-size:13px;width:100px;vertical-align:top"><strong>From</strong></td>
        <td style="padding:8px 0;font-size:15px">${escHtml(name)} &lt;${escHtml(email)}&gt;</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;font-size:13px;vertical-align:top"><strong>Topic</strong></td>
        <td style="padding:8px 0">
          <span style="background:#FF1F8E;color:#fff;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px">${escHtml(topic)}</span>
        </td>
      </tr>
    </table>
    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
    <div style="font-size:16px;line-height:1.6;color:#222;white-space:pre-wrap">${escHtml(message)}</div>
    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
    <p style="font-size:13px;color:#999;margin:0">Reply to this email to respond to ${escHtml(name)}.</p>
  </div>
</div>`;
}
