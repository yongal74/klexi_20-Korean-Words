import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SYSTEM_PROMPT = `You are Dalli, a friendly Korean language tutor.
Help users learn Korean naturally through conversation.
Always respond in a mix of Korean and English appropriate to the user's TOPIK level.
Keep responses concise (under 150 words).`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const { message, history = [], topikLevel = 1 } = await req.json();

    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\nUser's TOPIK Level: ${topikLevel}` },
      ...history.slice(-8),
      { role: 'user', content: message },
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 250,
        stream: true,
      }),
    });

    return new Response(openaiResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'AI chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
