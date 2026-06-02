export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Polar } from '@polar-sh/sdk';
import { createClient } from '@/lib/supabase/server';
import { POLAR_PRODUCT_IDS, APP_URL } from '@/lib/constants';

type Plan = 'starter' | 'pro' | 'lifetime';

// Sandbox ortamında self-signed sertifikaları atla (sadece lokal dev)
if (process.env.POLAR_SANDBOX === 'true' && process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { plan?: Plan };
    const plan = body.plan;
    if (!plan || !['starter', 'pro', 'lifetime'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const productId = POLAR_PRODUCT_IDS[plan.toUpperCase() as 'STARTER' | 'PRO' | 'LIFETIME'];
    if (!productId) {
      return NextResponse.json({ error: 'Product not configured' }, { status: 400 });
    }

    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const isSandbox = process.env.POLAR_SANDBOX === 'true';
    const polar = new Polar({
      accessToken,
      server: isSandbox ? 'sandbox' : 'production',
    });

    const checkout = await polar.checkouts.create({
      products: [productId],
      metadata: { user_id: user.id },
      successUrl: `${APP_URL}/dashboard?payment=success`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
