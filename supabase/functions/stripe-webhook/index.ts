/* eslint-disable */
// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@12?target=deno';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) return json({ error: 'Missing signature' }, 400);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return json({ error: 'Invalid signature' }, 400);
  }

  // TODO: map stripe customer to supabase user via your own storage (profiles.stripe_customer_id)
  // and update profiles.plan accordingly using supabase client.

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      // implement updating plan 'pro' or 'free' here
      break;
    default:
      break;
  }

  return json({ received: true });
});


