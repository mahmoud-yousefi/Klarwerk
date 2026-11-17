import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Globe,
  Landmark,
  Lock,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useCartDetails } from '@/hooks/useCart';
import { useCartStore } from '@/stores/cart.store';
import { getProductById } from '@/lib/catalog';
import { createCheckoutSchema, type CheckoutFormValues } from '@/lib/validation';
import { createDemoOrder } from '@/services/checkout.service';
import { useAuthStore } from '@/stores/auth.store';
import { CheckoutAuthGate } from '@/components/auth/CheckoutAuthGate';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import site from '@/data/site.json';

const steps = ['address', 'shipping', 'payment', 'review'] as const;
type Step = (typeof steps)[number];

const shippingMethods = [
  {
    id: 'standard' as const,
    icon: Truck,
    titleKey: 'shipping.standard',
    textKey: 'shipping.standardText',
    price: site.shippingMethods[0].price,
    days: site.shippingMethods[0].days,
  },
  {
    id: 'express' as const,
    icon: ArrowRight,
    titleKey: 'shipping.express',
    textKey: 'shipping.expressText',
    price: site.shippingMethods[1].price,
    days: site.shippingMethods[1].days,
  },
];

const paymentMethods = [
  { id: 'invoice' as const, icon: Receipt, titleKey: 'payment.invoice', textKey: 'payment.invoiceText' },
  { id: 'paypal' as const, icon: Globe, titleKey: 'payment.paypal', textKey: 'payment.paypalText' },
  { id: 'card' as const, icon: CreditCard, titleKey: 'payment.card', textKey: 'payment.cardText' },
  { id: 'sepa' as const, icon: Landmark, titleKey: 'payment.sepa', textKey: 'payment.sepaText' },
];

const countryOptions = [
  { value: 'Deutschland', labelDe: 'Deutschland', labelEn: 'Germany' },
  { value: 'Österreich', labelDe: 'Österreich', labelEn: 'Austria' },
  { value: 'Schweiz', labelDe: 'Schweiz', labelEn: 'Switzerland' },
];

export default function CheckoutPage() {
  const { t, i18n } = useTranslation('checkout');
  const user = useAuthStore((state) => state.user);
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const navigate = useNavigate();
  const { lines, subtotal, count } = useCartDetails();
  const clearCart = useCartStore((state) => state.clear);

  const [step, setStep] = useState<Step>('address');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] =
    useState<'invoice' | 'paypal' | 'card' | 'sepa'>('invoice');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = createCheckoutSchema({
    required: t('address.errorRequired'),
    email: t('address.errorEmail'),
    postal: t('address.errorPostal'),
  });

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      company: '',
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Deutschland',
      phone: '',
      note: '',
    },
  });

  const values = form.watch();
  const stepIndex = steps.indexOf(step);

  const shippingCost =
    shippingMethod === 'express'
      ? site.shippingMethods[1].price
      : subtotal >= site.freeShippingFrom
        ? 0
        : site.shippingMethods[0].price;
  const total = subtotal + shippingCost;
  const vatIncluded =
    Math.round((total - total / (1 + site.vatRate)) * 100) / 100;

  const continueFromAddress = form.handleSubmit(() => {
    setError(null);
    setStep('shipping');
  });

  const placeOrder = async () => {
    setError(null);
    const current = form.getValues();
    setProcessing(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      const order = createDemoOrder({
        items: lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
        customer: current,
        shippingMethod,
        paymentMethod,
        shippingLabel: t(`shipping.${shippingMethod}`),
        paymentLabel: t(`payment.${paymentMethod}`),
        expressPrice: site.shippingMethods[1].price,
        standardPrice: site.shippingMethods[0].price,
        freeShippingFrom: site.freeShippingFrom,
        vatRate: site.vatRate,
        productLookup: (id) => getProductById(id),
      });
      clearCart();
      navigate(`/order/${order.id}`);
    } catch {
      setError(t('errors.generic'));
      setProcessing(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon={<ShoppingBag size={24} />}
          title={t('empty.title')}
          text={t('empty.text')}
          action={
            <Link
              to="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-medium text-white transition hover:bg-ink-800"
            >
              {t('empty.cta')} <ArrowRight size={14} />
            </Link>
          }
        />
      </div>
    );
  }

  if (!user) {
    return <CheckoutAuthGate />;
  }

  const addressSummary = [
    values.firstName && values.lastName ? `${values.firstName} ${values.lastName}` : '',
    values.company,
    values.street && values.houseNumber ? `${values.street} ${values.houseNumber}` : values.street,
    values.postalCode && values.city ? `${values.postalCode} ${values.city}` : values.city,
    values.country,
  ].filter(Boolean);

  return (
    <div className="bg-mist">
      <div className="container-x py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: t('common:product.breadcrumbHome'), to: '/' },
            { label: t('common:cart.title'), to: '/cart' },
            { label: t('meta.title') },
          ]}
          className="mb-6"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              {t('meta.title')}
            </h1>
            <p className="mt-1.5 text-[12px] text-ink-900/50">{t('meta.subtitle')}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-900/50">
            <Lock size={11} /> {t('meta.secure')}
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-800">
          {t('meta.demoNotice')}
        </div>

        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto border-b border-ink-900/8 pb-4">
          {steps.map((entry, index) => {
            const done = index < stepIndex;
            const active = index === stepIndex;
            return (
              <div key={entry} className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={index > stepIndex}
                  onClick={() => index <= stepIndex && setStep(entry)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition',
                    active && 'bg-ink-900 text-white',
                    done && 'text-ink-900/60 hover:bg-ink-900/5',
                    !done && !active && 'text-ink-900/30',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[9px]',
                      active
                        ? 'bg-white/15 text-white'
                        : done
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : 'bg-ink-900/8 text-ink-900/40',
                    )}
                  >
                    {done ? <Check size={10} /> : index + 1}
                  </span>
                  {t(`steps.${entry}`)}
                </button>
                {index < steps.length - 1 && (
                  <span className="h-px w-3 bg-ink-900/10 sm:w-5" aria-hidden="true" />
                )}
              </div>
            );
          })}
          <span className="ml-auto hidden text-[10px] text-ink-900/35 sm:block">
            {t('meta.stepLabel', { current: stepIndex + 1, total: steps.length })}
          </span>
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
          <div className="rounded-3xl border border-ink-900/8 bg-white p-6 sm:p-8">
            {step === 'address' && (
              <form onSubmit={continueFromAddress} noValidate>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                  {t('address.title')}
                </h2>
                <p className="mt-1.5 text-[12px] text-ink-900/45">{t('address.subtitle')}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('address.email')}
                    type="email"
                    autoComplete="email"
                    placeholder={t('address.emailPlaceholder')}
                    error={form.formState.errors.email?.message}
                    wrapperClassName="sm:col-span-2"
                    {...form.register('email')}
                  />
                  <Input
                    label={t('address.firstName')}
                    autoComplete="given-name"
                    error={form.formState.errors.firstName?.message}
                    {...form.register('firstName')}
                  />
                  <Input
                    label={t('address.lastName')}
                    autoComplete="family-name"
                    error={form.formState.errors.lastName?.message}
                    {...form.register('lastName')}
                  />
                  <Input
                    label={t('address.company')}
                    optionalLabel={t('address.optional')}
                    autoComplete="organization"
                    wrapperClassName="sm:col-span-2"
                    {...form.register('company')}
                  />
                  <Input
                    label={t('address.street')}
                    autoComplete="address-line1"
                    error={form.formState.errors.street?.message}
                    {...form.register('street')}
                  />
                  <Input
                    label={t('address.houseNumber')}
                    autoComplete="address-line2"
                    error={form.formState.errors.houseNumber?.message}
                    {...form.register('houseNumber')}
                  />
                  <Input
                    label={t('address.postalCode')}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    error={form.formState.errors.postalCode?.message}
                    {...form.register('postalCode')}
                  />
                  <Input
                    label={t('address.city')}
                    autoComplete="address-level2"
                    error={form.formState.errors.city?.message}
                    {...form.register('city')}
                  />
                  <Select label={t('address.country')} {...form.register('country')}>
                    {countryOptions.map((country) => (
                      <option key={country.value} value={country.value}>
                        {locale === 'de' ? country.labelDe : country.labelEn}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label={t('address.phone')}
                    optionalLabel={t('address.optional')}
                    hint={t('address.phoneHint')}
                    autoComplete="tel"
                    {...form.register('phone')}
                  />
                  <Textarea
                    label={t('address.note')}
                    optionalLabel={t('address.optional')}
                    placeholder={t('address.notePlaceholder')}
                    rows={2}
                    wrapperClassName="sm:col-span-2"
                    {...form.register('note')}
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/8 pt-5">
                  <Link
                    to="/cart"
                    className="inline-flex items-center gap-1.5 text-[11px] text-ink-900/45 transition hover:text-ink-900"
                  >
                    <ArrowLeft size={12} /> {t('summary.editCart')}
                  </Link>
                  <button
                    type="submit"
                    className="flex h-11 items-center gap-2 rounded-full bg-electric-500 px-6 text-[13px] font-semibold text-white transition hover:bg-electric-400"
                  >
                    {t('address.continue')} <ArrowRight size={14} />
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-ink-900/30">{t('address.demoData')}</p>
              </form>
            )}

            {step === 'shipping' && (
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                  {t('shipping.title')}
                </h2>
                <p className="mt-1.5 text-[12px] text-ink-900/45">{t('shipping.subtitle')}</p>

                <div className="mt-6 space-y-2.5">
                  {shippingMethods.map((method) => {
                    const price =
                      method.id === 'express'
                        ? method.price
                        : subtotal >= site.freeShippingFrom
                          ? 0
                          : method.price;
                    return (
                      <label
                        key={method.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition',
                          shippingMethod === method.id
                            ? 'border-electric-500 bg-electric-500/[0.045] ring-2 ring-electric-500/10'
                            : 'border-ink-900/10 hover:border-ink-900/25',
                        )}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={() => setShippingMethod(method.id)}
                          className="mt-1 h-3.5 w-3.5 text-electric-500 focus:ring-electric-500/20"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-[13px] font-medium">
                              <method.icon size={14} className="text-ink-900/40" />
                              {t(method.titleKey)}
                            </span>
                            <span className="text-[13px] font-semibold tabular-nums">
                              {price === 0 ? t('shipping.free') : formatPrice(price, locale)}
                            </span>
                          </span>
                          <span className="mt-1 block text-[11px] text-ink-900/45">
                            {t(method.textKey)}
                          </span>
                          <span className="mt-1 block text-[10px] text-ink-900/35">
                            {method.days[locale]}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                <p className="mt-4 text-[10px] text-ink-900/35">{t('shipping.note')}</p>

                <div className="mt-6 flex items-center justify-between border-t border-ink-900/8 pt-5">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="inline-flex items-center gap-1.5 text-[11px] text-ink-900/45 transition hover:text-ink-900"
                  >
                    <ArrowLeft size={12} /> {t('common:actions.back')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('payment')}
                    className="flex h-11 items-center gap-2 rounded-full bg-electric-500 px-6 text-[13px] font-semibold text-white transition hover:bg-electric-400"
                  >
                    {t('shipping.continue')} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                  {t('payment.title')}
                </h2>
                <p className="mt-1.5 text-[12px] text-ink-900/45">{t('payment.subtitle')}</p>

                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition',
                        paymentMethod === method.id
                          ? 'border-electric-500 bg-electric-500/[0.045] ring-2 ring-electric-500/10'
                          : 'border-ink-900/10 hover:border-ink-900/25',
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mt-1 h-3.5 w-3.5 text-electric-500 focus:ring-electric-500/20"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[12px] font-medium">
                          <method.icon size={14} className="text-ink-900/40" />
                          {t(method.titleKey)}
                        </span>
                        <span className="mt-1 block text-[10px] leading-relaxed text-ink-900/45">
                          {t(method.textKey)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                <p className="mt-4 flex items-center gap-1.5 text-[10px] text-emerald-700">
                  <ShieldCheck size={12} /> {t('payment.securityNote')}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-ink-900/8 pt-5">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="inline-flex items-center gap-1.5 text-[11px] text-ink-900/45 transition hover:text-ink-900"
                  >
                    <ArrowLeft size={12} /> {t('common:actions.back')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('review')}
                    className="flex h-11 items-center gap-2 rounded-full bg-electric-500 px-6 text-[13px] font-semibold text-white transition hover:bg-electric-400"
                  >
                    {t('payment.continue')} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                  {t('review.title')}
                </h2>
                <p className="mt-1.5 text-[12px] text-ink-900/45">{t('review.subtitle')}</p>

                <div className="mt-6 space-y-2.5">
                  {[
                    {
                      title: t('review.contact'),
                      body: (
                        <>
                          <p>{values.email}</p>
                          {values.phone && <p className="text-ink-900/45">{values.phone}</p>}
                        </>
                      ),
                      step: 'address' as Step,
                    },
                    {
                      title: t('review.shippingAddress'),
                      body: (
                        <>
                          <p>{addressSummary[0]}</p>
                          {addressSummary.slice(1).map((line) => (
                            <p key={line} className="text-ink-900/50">
                              {line}
                            </p>
                          ))}
                        </>
                      ),
                      step: 'address' as Step,
                    },
                    {
                      title: t('review.shippingMethod'),
                      body: (
                        <>
                          <p>{t(`shipping.${shippingMethod}`)}</p>
                          <p className="text-ink-900/45">
                            {shippingMethod === 'express'
                              ? site.shippingMethods[1].days[locale]
                              : site.shippingMethods[0].days[locale]}{' '}
                            ·{' '}
                            {shippingCost === 0
                              ? t('shipping.free')
                              : formatPrice(shippingCost, locale)}
                          </p>
                        </>
                      ),
                      step: 'shipping' as Step,
                    },
                    {
                      title: t('review.paymentMethod'),
                      body: <p>{t(`payment.${paymentMethod}`)}</p>,
                      step: 'payment' as Step,
                    },
                  ].map((section) => (
                    <div
                      key={section.title}
                      className="flex items-start justify-between gap-4 rounded-2xl bg-mist p-4"
                    >
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/35">
                          {section.title}
                        </p>
                        <div className="mt-1.5 space-y-0.5 text-[12px] leading-relaxed">
                          {section.body}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(section.step)}
                        className="text-[10px] text-electric-600 underline decoration-electric-500/30 underline-offset-4 hover:text-electric-500"
                      >
                        {t('review.edit')}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-ink-900/8 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/35">
                    {t('review.deliveryEstimate', {
                      days:
                        shippingMethod === 'express'
                          ? site.shippingMethods[1].days[locale]
                          : site.shippingMethods[0].days[locale],
                    })}
                  </p>
                </div>

                {error && (
                  <p className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[11px] text-rose-600">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 border-t border-ink-900/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('payment')}
                    className="inline-flex items-center gap-1.5 text-[11px] text-ink-900/45 transition hover:text-ink-900"
                  >
                    <ArrowLeft size={12} /> {t('review.back')}
                  </button>
                  <button
                    type="button"
                    onClick={placeOrder}
                    disabled={processing}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-electric-500 px-6 text-[13px] font-semibold text-white shadow-[0_16px_36px_-16px_rgba(88,101,242,0.9)] transition hover:bg-electric-400 disabled:pointer-events-none disabled:opacity-60"
                  >
                    {processing ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {t('review.processing')}
                      </>
                    ) : (
                      <>
                        <Lock size={13} /> {t('review.placeOrder')}
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-ink-900/35">{t('review.terms')}</p>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-3xl border border-ink-900/8 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">
                  {t('summary.title')}
                </h2>
                <Link
                  to="/cart"
                  className="text-[10px] text-ink-900/40 underline underline-offset-4 hover:text-ink-900"
                >
                  {t('summary.editCart')}
                </Link>
              </div>

              <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                {lines.map(({ product, quantity, lineTotal }) => (
                  <li key={product.id} className="flex gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-900 px-1 text-[9px] font-bold text-white">
                        {quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium">{product.name}</p>
                      <p className="text-[10px] text-ink-900/35">{product.brand}</p>
                    </div>
                    <span className="text-[11px] font-medium tabular-nums">
                      {formatPrice(lineTotal, locale)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2 border-t border-ink-900/8 pt-4 text-[12px]">
                <div className="flex justify-between text-ink-900/55">
                  <span>
                    {t('summary.subtotal')} · {count === 1 ? t('common:cart.oneItem') : t('common:cart.items', { count })}
                  </span>
                  <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
                </div>
                <div className="flex justify-between text-ink-900/55">
                  <span>{t('summary.shipping')}</span>
                  <span className="tabular-nums">
                    {shippingCost === 0
                      ? t('summary.freeShipping')
                      : formatPrice(shippingCost, locale)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-ink-900/8 pt-2.5 text-[15px] font-semibold">
                  <span>{t('summary.total')}</span>
                  <span className="tabular-nums">{formatPrice(total, locale)}</span>
                </div>
                <p className="text-[10px] text-ink-900/35">
                  {t('summary.vat', { amount: formatPrice(vatIncluded, locale) })}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <input
                  disabled
                  placeholder={t('summary.promoPlaceholder')}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-ink-900/10 bg-mist px-3 text-[11px] placeholder:text-ink-900/30"
                />
                <button
                  type="button"
                  disabled
                  className="h-9 shrink-0 rounded-lg bg-ink-900/8 px-3 text-[11px] font-medium text-ink-900/35"
                >
                  {t('summary.promoApply')}
                </button>
              </div>
              <p className="mt-1.5 text-[9px] text-ink-900/30">{t('summary.promoDemo')}</p>

              <p className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 text-[10px] font-medium text-emerald-700">
                <Lock size={10} /> {t('summary.secureNote')}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
