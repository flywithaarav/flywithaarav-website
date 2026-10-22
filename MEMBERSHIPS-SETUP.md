# FlyWithAarav memberships — secure payment setup

Membership page source: `membership.html` and `membership.js`.

The Supabase Edge Function source is included here:
- `membership-checkout/index.ts`: creates Stripe Checkout sessions only after validating the signed-in user. Admins in `public.user_roles` are exempt.
- `stripe-membership-webhook/index.ts`: verifies Stripe webhook signatures and updates `public.memberships` using the service-role key only on the server.

## Required configuration before real payments
Set these Supabase Edge Function secrets in the Supabase dashboard (Project Settings / Edge Functions / Secrets or the function secrets panel):
- `STRIPE_SECRET_KEY` — secret key from the Stripe account (never put it in website JavaScript or GitHub)
- `STRIPE_PRICE_SILVER` — Stripe recurring Price ID for £2.99/month
- `STRIPE_PRICE_GOLD` — Stripe recurring Price ID for £4.99/month
- `STRIPE_PRICE_PLATINUM` — Stripe recurring Price ID for £9.99/month
- `STRIPE_WEBHOOK_SECRET` — signing secret from the Stripe webhook endpoint

Deploy the two functions to Supabase. Configure a Stripe webhook endpoint to:
`https://upvkjgwnavtkcsyzwjjn.supabase.co/functions/v1/stripe-membership-webhook`
Subscribe to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`.

Use a Stripe account owned/managed by a parent or guardian if required by Stripe's age rules. Do not share secret keys in chat. Payments are not live until the Stripe secrets, recurring price IDs, webhook, and deployed functions are configured and tested.
