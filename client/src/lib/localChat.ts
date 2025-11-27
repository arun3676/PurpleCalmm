// Local chat service using OpenAI API
import { getChatMessages, saveChatMessage, getUserSettings } from './localStorage';

// OpenAI API configuration - user will provide their own API key
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function sendChatMessage(userMessage: string): Promise<string> {
  // Save user message
  saveChatMessage({
    role: 'user',
    content: userMessage,
  });

  // Get personality mode
  const settings = getUserSettings();
  const personality = settings.chatPersonality || 'comforting';

  // Get chat history (last 10 messages to keep context manageable)
  const history = getChatMessages().slice(-10);
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

  try {
    // Validate API key
    if (!OPENAI_API_KEY) {
      console.error('Missing OpenAI API key');
      throw new Error('Please add your OpenAI API key in the environment variables (VITE_OPENAI_API_KEY)');
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 150, // Keep responses short
        temperature: 0.8, // Slightly creative but consistent
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Purr... I\'m here for you.';

    // Save AI response
    saveChatMessage({
      role: 'assistant',
      content: aiMessage.trim(),
    });

    return aiMessage.trim();
  } catch (error) {
    console.error('Chat error:', error);
    
    // Provide helpful error messages
    let fallbackMessage = 'Meow... Something went wrong. Try again?';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        fallbackMessage = '🔑 Please add your OpenAI API key to use Rani chat. Check the console for details.';
      } else if (error.message.includes('Rate limit')) {
        fallbackMessage = '⏳ Too many messages! Please wait a moment before trying again.';
      }
    }
    
    saveChatMessage({
      role: 'assistant',
      content: fallbackMessage,
    });
    
    throw error; // Re-throw to show error in UI
  }
}
