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
      case 'order.paid': {
        const productId = event.data.productId;
        const userId = String(event.data.metadata?.['user_id'] ?? '');
        if (!userId || !productId) break;

        if (productId === POLAR_PRODUCT_IDS.STARTER) {
          const { data: current, error: fetchErr } = await supabase
            .from('user_credits')
            .select('credits')
            .eq('user_id', userId)
            .single<{ credits: number }>();

          if (fetchErr) { console.error('polar webhook fetch credits error:', fetchErr); break; }

          const { error } = await supabase
            .from('user_credits')
            .update({ credits: (current?.credits ?? 0) + 5, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

          if (error) console.error('polar webhook update starter error:', error);

        } else if (productId === POLAR_PRODUCT_IDS.LIFETIME) {
          const { error } = await supabase
            .from('user_credits')
            .update({ is_pro: true, pro_expires_at: null, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

          if (error) console.error('polar webhook update lifetime error:', error);
        }
        break;
      }

      case 'subscription.active': {
        const productId = event.data.productId;
        const userId = String(event.data.metadata?.['user_id'] ?? '');
        if (!userId) break;

        if (productId === POLAR_PRODUCT_IDS.PRO) {
          const proExpiresAt = event.data.currentPeriodEnd.toISOString();
          const { error } = await supabase
            .from('user_credits')
            .update({ is_pro: true, pro_expires_at: proExpiresAt, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

          if (error) console.error('polar webhook update pro error:', error);
        }
        break;
      }

      case 'subscription.updated': {
        const productId = event.data.productId;
        const userId = String(event.data.metadata?.['user_id'] ?? '');
        if (!userId) break;

        if (productId === POLAR_PRODUCT_IDS.PRO) {
          const { error } = await supabase
            .from('user_credits')
            .update({ is_pro: true, pro_expires_at: event.data.currentPeriodEnd.toISOString(), updated_at: new Date().toISOString() })
            .eq('user_id', userId);

          if (error) console.error('polar webhook update subscription error:', error);
        }
        break;
      }

      case 'subscription.revoked': {
        const userId = String(event.data.metadata?.['user_id'] ?? '');
        if (!userId) break;

        const { error } = await supabase
          .from('user_credits')
          .update({ is_pro: false, pro_expires_at: null, updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (error) console.error('polar webhook revoke pro error:', error);
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
