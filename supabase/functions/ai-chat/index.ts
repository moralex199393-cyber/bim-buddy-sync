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

    console.log('Sending request to OpenRouter with DeepSeek...');

    // Используем бесплатную модель DeepSeek через OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Revit BIM Assistant'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter response received');

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
