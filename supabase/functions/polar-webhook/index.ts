import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const payload = await req.json();

    const signature = req.headers.get('webhook-signature');
    if (!signature) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { type, data } = payload;

    if (type === 'subscription.created' || type === 'subscription.updated') {
      const userId = data.metadata?.userId;
      const isActive = data.status === 'active';

      if (userId) {
        await supabase
          .from('user_profiles')
          .upsert({
            id: userId,
            is_premium: isActive,
            polar_subscription_id: data.id,
            premium_expires_at: data.current_period_end,
          });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
});
