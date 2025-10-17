/* eslint-disable */
// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@12?target=deno';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const APP_SCHEME = Deno.env.get('APP_SCHEME') ?? 'mrlater';
const stripe = new Stripe(STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
  });
}

function cors() {
  return new Response(null, {
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return cors();
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { customerId } = await req.json();
    if (!customerId) return json({ error: 'Missing customerId' }, 400);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_SCHEME}://plans`,
    });
    return json({ url: session.url });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});


