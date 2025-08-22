import { loadStripe, Stripe } from "@stripe/stripe-js";

// อย่าลืมตั้ง NEXT_PUBLIC_STRIPE_PK
export const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PK as string,
);
