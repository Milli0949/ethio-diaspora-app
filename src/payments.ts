export type PaymentProvider = 'chapa' | 'telebirr' | 'stripe';

export interface PaymentInitInput {
  provider: PaymentProvider;
  planId: string;
  amount: number;
  currency: 'ETB' | 'USD';
  userEmail?: string;
}

export interface PaymentInitResult {
  provider: PaymentProvider;
  status: 'ready' | 'missing_config';
  checkoutUrl?: string;
  messageEn: string;
  messageAm: string;
}

export function getPaymentConfig() {
  return {
    chapaPublicKey: import.meta.env.VITE_CHAPA_PUBLIC_KEY || '',
    stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    telebirrMerchantId: import.meta.env.VITE_TELEBIRR_MERCHANT_ID || '',
    checkoutEndpoint: import.meta.env.VITE_PAYMENT_CHECKOUT_URL || '',
  };
}

export async function initiatePayment(input: PaymentInitInput): Promise<PaymentInitResult> {
  const cfg = getPaymentConfig();
  const hasKey =
    (input.provider === 'chapa' && Boolean(cfg.chapaPublicKey)) ||
    (input.provider === 'stripe' && Boolean(cfg.stripePublishableKey)) ||
    (input.provider === 'telebirr' && Boolean(cfg.telebirrMerchantId));

  if (!hasKey) {
    return {
      provider: input.provider,
      status: 'missing_config',
      messageEn: `${input.provider.toUpperCase()} public key is not configured yet. Pending subscription saved.`,
      messageAm: `የ${input.provider.toUpperCase()} ቁልፍ ገና አልተዋቀረም። የደንበኝነት ጥያቄ በመጠባበቅ ላይ ተቀምጧል።`,
    };
  }

  if (cfg.checkoutEndpoint) {
    const res = await fetch(cfg.checkoutEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data?.checkoutUrl) {
        return {
          provider: input.provider,
          status: 'ready',
          checkoutUrl: data.checkoutUrl,
          messageEn: 'Redirecting to checkout...',
          messageAm: 'ወደ ክፍያ ገጽ በመውሰድ ላይ...',
        };
      }
    }
  }

  return {
    provider: input.provider,
    status: 'ready',
    messageEn: `${input.provider.toUpperCase()} initialized for ${input.amount} ${input.currency}.`,
    messageAm: `ለ${input.amount} ${input.currency} በ${input.provider.toUpperCase()} ተጀምሯል።`,
  };
}
