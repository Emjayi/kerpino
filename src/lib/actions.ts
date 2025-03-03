'use server'

import { AuthError } from 'next-auth';
import { z } from 'zod';
import postgres from 'postgres';
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const sql = postgres();
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
}


const signInWith = (provider: any) => async () => {
    const supabase = await createClient();
    const auth_callback_url = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: auth_callback_url }
    })

    if (error) {
        console.error('Error during sign in:', error);
        throw new AuthError('OAuth sign-in failed');
    }

    console.log(data, error)
    redirect(data?.url)
}

export const signInWithGoogle = signInWith('google');
