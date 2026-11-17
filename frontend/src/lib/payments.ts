import { withBase } from '@/lib/catalog';

export interface PaymentMark {
  id: string;
  label: string;
  src: string;
  /** Rendered height in px — the marks have different aspect ratios. */
  height: number;
  maxWidth: number;
}

/**
 * Official brand marks stored locally so the storefront never hotlinks a
 * third-party CDN and keeps working offline / on GitHub Pages.
 */
export const paymentMarks: PaymentMark[] = [
  { id: 'paypal', label: 'PayPal', src: withBase('/assets/payments/paypal.svg'), height: 18, maxWidth: 68 },
  { id: 'visa', label: 'Visa', src: withBase('/assets/payments/visa.svg'), height: 14, maxWidth: 42 },
  { id: 'mastercard', label: 'Mastercard', src: withBase('/assets/payments/mastercard.svg'), height: 20, maxWidth: 34 },
  { id: 'amex', label: 'American Express', src: withBase('/assets/payments/amex.svg'), height: 20, maxWidth: 32 },
  { id: 'applepay', label: 'Apple Pay', src: withBase('/assets/payments/applepay.svg'), height: 17, maxWidth: 48 },
  { id: 'klarna', label: 'Klarna', src: withBase('/assets/payments/klarna.svg'), height: 15, maxWidth: 52 },
];

export type InstallmentMonths = 3 | 6 | 12;

export interface InstallmentPlan {
  months: InstallmentMonths;
  monthly: number;
  total: number;
  interest: number;
  apr: number;
}

export interface InstallmentOptions {
  /** Zero-interest, three-installment plan — always shown first. */
  short: InstallmentPlan;
  /** Longer financing option for larger baskets. */
  long: InstallmentPlan;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Deterministic, client-side financing preview. The short plan is always
 * interest-free; the long plan carries a small illustrative APR.
 */
export function installmentOptions(total: number): InstallmentOptions {
  const shortMonthly = total > 0 ? round(total / 3) : 0;
  const longInterestRate = 0.029;
  const longTotal = total > 0 ? round(total * (1 + longInterestRate)) : 0;
  const longMonthly = longTotal > 0 ? round(longTotal / 12) : 0;

  return {
    short: { months: 3, monthly: shortMonthly, total, interest: 0, apr: 0 },
    long: {
      months: 12,
      monthly: longMonthly,
      total: longTotal,
      interest: round(longTotal - total),
      apr: longInterestRate * 100,
    },
  };
}

export const paymentMethodIcons = paymentMarks;
