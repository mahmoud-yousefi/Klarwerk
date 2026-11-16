import { z } from 'zod';

export interface CheckoutMessages {
  required: string;
  email: string;
  postal: string;
}

export const createCheckoutSchema = (messages: CheckoutMessages) =>
  z.object({
    email: z.string().min(1, messages.required).email(messages.email),
    firstName: z.string().min(2, messages.required),
    lastName: z.string().min(2, messages.required),
    company: z.string().optional(),
    street: z.string().min(2, messages.required),
    houseNumber: z.string().min(1, messages.required),
    postalCode: z
      .string()
      .regex(/^\d{4,5}$/, messages.postal),
    city: z.string().min(2, messages.required),
    country: z.string().min(1, messages.required),
    phone: z.string().optional(),
    note: z.string().max(300).optional(),
  });

export type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutSchema>>;
