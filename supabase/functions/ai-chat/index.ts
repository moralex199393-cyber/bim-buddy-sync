import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Создаем системное сообщение для BIM-менеджера
    const systemMessage: Message = {
      role: 'system',
      content: `Ты опытный BIM-менеджер, специализирующийся на Autodesk Revit. 
Твоя задача - помогать пользователям с вопросами по:
- Работе с моделями Revit
- Управлению проектами BIM
- Решению технических проблем
- Оптимизации рабочих процессов
- Координации между специалистами
- Стандартам и практикам BIM

Отвечай профессионально, конкретно и по существу. Используй русский язык.`
    };

    // Подготавливаем историю сообщений
    const messages: Message[] = [
      systemMessage,
      ...history.filter((msg: Message) => msg.role !== 'system'),
      { role: 'user', content: message }
    ];

    console.log('Sending request to Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Превышен лимит запросов. Пожалуйста, попробуйте позже.',
            response: 'Превышен лимит запросов. Пожалуйста, попробуйте позже.'
          }), 
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Требуется пополнение баланса.',
            response: 'Требуется пополнение баланса.'
          }), 
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const aiResponse = data.choices?.[0]?.message?.content || 
                       'Извините, не могу обработать ваш запрос в данный момент.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        response: 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте снова.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
