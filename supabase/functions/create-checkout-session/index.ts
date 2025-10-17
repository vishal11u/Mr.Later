/* eslint-disable */
// @ts-nocheck
// Deno Deploy / Supabase Edge Function
// POST { userId: string }
import Stripe from 'https://esm.sh/stripe@12?target=deno';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!; // set via supabase secrets
const STRIPE_PRICE_ID = Deno.env.get('STRIPE_PRICE_ID')!; // your Pro price id
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
    const { userId, customerId } = await req.json();
    if (!userId) return json({ error: 'Missing userId' }, 400);

    // Optionally create/reuse customer outside of this call and pass in
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      customer: customerId,
      success_url: `${APP_SCHEME}://plans?status=success`,
      cancel_url: `${APP_SCHEME}://plans?status=cancel`,
      allow_promotion_codes: true,
    });

    return json({ url: session.url });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});


