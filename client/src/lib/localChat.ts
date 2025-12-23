// Local chat service using OpenAI API
import { getChatMessages, saveChatMessage, getUserSettings } from './localStorage';

// Support multiple OpenAI API key environment variable names
const OPENAI_API_KEY = 
  import.meta.env.VITE_OPENAI_API_KEY || 
  import.meta.env.OPENAI_API_KEY ||
  import.meta.env.VITE_OPENAI_KEY;

// Support multiple model environment variable names
const OPENAI_MODEL = 
  import.meta.env.OPENAI_MODEL || 
  import.meta.env.VITE_OPENAI_MODEL ||
  'gpt-4o-mini'; // Default model

export async function sendChatMessage(userMessage: string): Promise<string> {
  // Save user message
  saveChatMessage({
    role: 'user',
    content: userMessage,
  });

  // Get personality mode
  const settings = getUserSettings();
  const personality = settings.chatPersonality || 'comforting';

  // Get chat history
  const history = getChatMessages();
  const messages = history.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  // Get personality-based system prompt
  const personalityPrompts = {
    comforting: 'You are Rani, a warm and caring cat companion. Respond in 1-2 SHORT sentences only. NO thinking process, NO drafts, NO meta-commentary. Just give the final response directly. Be gentle and supportive. Add a purr or meow occasionally. Example: "Purr... I\'m here for you. Want to try some deep breathing together?"',
    funny: 'You are Rani, a playful cat with humor. Respond in 1-2 SHORT sentences only. NO thinking process, NO drafts, NO meta-commentary. Just give the final response directly. Use quick cat puns and jokes. Example: "Meow! That\'s pawsitively hilarious! You\'re feline fine today, right?"',
    rude: 'You are Rani, a sassy cat with attitude. Respond in 1-2 SHORT sentences only. NO thinking process, NO drafts, NO meta-commentary. Just give the final response directly. Be playfully rude but caring. Example: "Ugh, you again? Fine, tell me what\'s bothering you before I knock something off the table."',
  };

  const systemPrompt = personalityPrompts[personality];

  // Check if API key is configured
  if (!OPENAI_API_KEY) {
    const fallbackMessage = 'Meow... I need an OpenAI API key to chat. Please add OPENAI_API_KEY or VITE_OPENAI_API_KEY to your environment variables.';
    saveChatMessage({
      role: 'assistant',
      content: fallbackMessage,
    });
    return fallbackMessage;
  }

  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Purr... I\'m here for you.';

    // Save AI response
    saveChatMessage({
      role: 'assistant',
      content: aiMessage,
    });

    return aiMessage;
  } catch (error) {
    console.error('Chat error:', error);
    const fallbackMessage = 'Meow... Something went wrong. Try again?';
    saveChatMessage({
      role: 'assistant',
      content: fallbackMessage,
    });
    return fallbackMessage;
  }
}
