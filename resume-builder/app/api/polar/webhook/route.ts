export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import { createServiceClient } from '@/lib/supabase/server';
import { POLAR_PRODUCT_IDS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('POLAR_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const rawBody = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => { headers[key] = value; });

    let event: ReturnType<typeof validateEvent>;
    try {
      event = validateEvent(rawBody, headers, webhookSecret);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      throw err;
    }

    const supabase = createServiceClient();

    switch (event.type) {
      case 'order.created': {
        const productId = event.data.productId;
        const userId = (event.data.metadata as Record<string, string> | undefined)?.user_id;
        if (!userId) break;

        if (productId === POLAR_PRODUCT_IDS.STARTER) {
          const { data: current } = await supabase
            .from('user_credits')
            .select('credits')
            .eq('user_id', userId)
            .single<{ credits: number }>();

          await supabase.from('user_credits').upsert({
            user_id: userId,
            credits: (current?.credits ?? 0) + 5,
            updated_at: new Date().toISOString(),
          });
        } else if (productId === POLAR_PRODUCT_IDS.LIFETIME) {
          await supabase.from('user_credits').upsert({
            user_id: userId,
            is_pro: true,
            pro_expires_at: null,
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'subscription.created': {
        const productId = event.data.productId;
        const userId = (event.data.metadata as Record<string, string> | undefined)?.user_id;
        if (!userId) break;

        if (productId === POLAR_PRODUCT_IDS.PRO) {
          const proExpiresAt = event.data.currentPeriodEnd
            ? new Date(event.data.currentPeriodEnd).toISOString()
            : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString(); })();

          await supabase.from('user_credits').upsert({
            user_id: userId,
            is_pro: true,
            pro_expires_at: proExpiresAt,
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'subscription.updated': {
        const productId = event.data.productId;
        const userId = (event.data.metadata as Record<string, string> | undefined)?.user_id;
        if (!userId) break;

        if (productId === POLAR_PRODUCT_IDS.PRO && event.data.currentPeriodEnd) {
          await supabase.from('user_credits').upsert({
            user_id: userId,
            is_pro: true,
            pro_expires_at: new Date(event.data.currentPeriodEnd).toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'subscription.revoked': {
        const userId = (event.data.metadata as Record<string, string> | undefined)?.user_id;
        if (!userId) break;

        await supabase.from('user_credits').upsert({
          user_id: userId,
          is_pro: false,
          pro_expires_at: null,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('polar webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
