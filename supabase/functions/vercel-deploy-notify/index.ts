// Receives Vercel's deployment webhook and tells you on Telegram once a
// production deploy finishes.
//
// Vercel signs each webhook request with HMAC-SHA1 over the raw body, using a
// secret it shows you once when you create the webhook (Project/Team →
// Settings → Webhooks). That secret is VERCEL_WEBHOOK_SECRET here — the
// request is rejected unless x-vercel-signature matches, same trust-boundary
// pattern as telegram-bot's secret_token check.
//
// verify_jwt is OFF (see supabase/config.toml): Vercel can't present a
// Supabase JWT either.
//
// Only `deployment.succeeded` events for the `production` target are acted
// on — Vercel also fires this webhook for every preview deployment (every
// branch push, every PR), which would spam a message per PR update instead
// of once per actual release.
//
// The version number comes from the git commit that triggered the deploy:
// the version-bump workflow (.github/workflows/bump-version.yml) commits as
// "chore: release vX.Y.Z" directly to main after a PR merges, and that's the
// commit Vercel builds. No separate call to read package.json is needed.

import { ALLOWED_CHAT_IDS, sendMessage } from '../_shared/telegram.ts';

const WEBHOOK_SECRET = Deno.env.get('VERCEL_WEBHOOK_SECRET') ?? '';

const CHAT_IDS: number[] = ALLOWED_CHAT_IDS.map((s) => Number(s)).filter(
  (n) => Number.isFinite(n)
);

interface VercelWebhookPayload {
  type?: string;
  payload?: {
    target?: string;
    url?: string;
    deployment?: {
      meta?: {
        githubCommitMessage?: string;
      };
    };
  };
}

async function verifySignature(rawBody: string, presented: string): Promise<boolean> {
  if (!WEBHOOK_SECRET || !presented) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const computed = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  // Same length check up front avoids leaking timing info via early exit in
  // the comparison itself.
  if (computed.length !== presented.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ presented.charCodeAt(i);
  }
  return diff === 0;
}

function extractVersion(commitMessage: string | undefined): string | null {
  const match = commitMessage?.match(/\bv(\d+\.\d+\.\d+)\b/);
  return match ? match[1] : null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await req.text();
  const presented = req.headers.get('x-vercel-signature') ?? '';
  if (!(await verifySignature(rawBody, presented))) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: VercelWebhookPayload;
  try {
    body = JSON.parse(rawBody) as VercelWebhookPayload;
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // Acknowledge everything else (irrelevant event types, preview deploys) so
  // Vercel doesn't retry — there's just nothing to notify about.
  if (body.type !== 'deployment.succeeded' || body.payload?.target !== 'production') {
    return new Response('ignored', { status: 200 });
  }

  const version = extractVersion(body.payload?.deployment?.meta?.githubCommitMessage);
  const url = body.payload?.url;
  const message = [
    version ? `Deployed v${version}.` : 'Deployed.',
    url ? `https://${url}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  await Promise.all(CHAT_IDS.map((chatId) => sendMessage(chatId, message)));

  return new Response('ok', { status: 200 });
});
