// Local chat service using frontend Manus AI API
import { getChatMessages, saveChatMessage, getUserSettings } from './localStorage';

const FRONTEND_API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FRONTEND_API_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL;

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

  try {
    // Call Manus AI API from frontend
    const response = await fetch(`${FRONTEND_API_URL}/llm/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FRONTEND_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
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
