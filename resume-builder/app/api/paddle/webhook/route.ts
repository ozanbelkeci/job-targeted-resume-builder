export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';

interface PaddleTransactionCompletedEvent {
  event_type: string;
  data: {
    id: string;
    status: string;
    items: Array<{
      price: {
        product_id: string;
      };
    }>;
    custom_data: {
      user_id: string;
    } | null;
  };
}

function verifyPaddleSignature(payload: string, signature: string, secret: string): boolean {
  const parts = signature.split(';');
  const tsPart = parts.find((p) => p.startsWith('ts='));
  const h1Part = parts.find((p) => p.startsWith('h1='));

  if (!tsPart || !h1Part) return false;

  const ts = tsPart.replace('ts=', '');
  const h1 = h1Part.replace('h1=', '');
  const signedPayload = `${ts}:${payload}`;

  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');

  return expected === h1;
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('PADDLE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const signature = request.headers.get('Paddle-Signature') ?? '';
    const rawBody = await request.text();

    if (!verifyPaddleSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as PaddleTransactionCompletedEvent;

    if (event.event_type !== 'transaction.completed') {
      return NextResponse.json({ data: { received: true } });
    }

    const userId = event.data.custom_data?.user_id;
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id in custom_data' }, { status: 400 });
    }

    const productId = event.data.items[0]?.price?.product_id;
    const starterProductId = process.env.PADDLE_PRODUCT_STARTER;
    const proProductId = process.env.PADDLE_PRODUCT_PRO;

    const supabase = createServiceClient();

    if (productId === starterProductId) {
      const { data: current } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single<{ credits: number }>();

      await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits: (current?.credits ?? 0) + 5,
          updated_at: new Date().toISOString(),
        });
    } else if (productId === proProductId) {
      const proExpiresAt = new Date();
      proExpiresAt.setDate(proExpiresAt.getDate() + 30);

      await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          is_pro: true,
          pro_expires_at: proExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({ data: { received: true } });
  } catch (err) {
    console.error('paddle webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
