// AI-powered migraine relief tips using OpenAI API
import { MigraineLog } from './localStorage';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateMigraineTips(log: MigraineLog): Promise<string> {
  if (!OPENAI_API_KEY) {
    return getDefaultTips(log);
  }

  try {
    // Build a detailed prompt based on the migraine log
    const prompt = buildMigrainePrompt(log);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful migraine relief advisor. Based on the user's migraine details, provide 3-4 specific, actionable relief tips. Keep tips concise (1-2 sentences each). Focus on immediate relief strategies and prevention for future migraines. Be empathetic and supportive.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return getDefaultTips(log);
    }

    const data = await response.json();
    const tips = data.choices?.[0]?.message?.content || getDefaultTips(log);
    return tips.trim();
  } catch (error) {
    console.error('Error generating migraine tips:', error);
    return getDefaultTips(log);
  }
}

function buildMigrainePrompt(log: MigraineLog): string {
  const parts = [];

  parts.push(`I just logged a migraine with the following details:`);
  parts.push(`- Severity: ${log.severity}/10`);

  if (log.duration) {
    parts.push(`- Duration: ${log.duration} minutes`);
  }

  if (log.triggers && log.triggers.length > 0) {
    parts.push(`- Possible triggers: ${log.triggers.join(', ')}`);
  }

  if (log.symptoms && log.symptoms.length > 0) {
    parts.push(`- Symptoms: ${log.symptoms.join(', ')}`);
  }

  if (log.medication) {
    parts.push(`- Medication taken: ${log.medication}`);
  }

  if (log.notes) {
    parts.push(`- Additional notes: ${log.notes}`);
  }

  parts.push(`\nBased on this information, what are the best relief tips I should try right now?`);

  return parts.join('\n');
}

function getDefaultTips(log: MigraineLog): string {
  const tips: string[] = [];

  // Severity-based tips
  if (log.severity >= 8) {
    tips.push('🌙 **Immediate Relief**: Find a dark, quiet room and rest. Consider applying a cold compress to your forehead or neck.');
  } else if (log.severity >= 5) {
    tips.push('💧 **Hydration**: Drink water slowly. Dehydration often worsens migraines. Consider electrolyte drinks if available.');
  } else {
    tips.push('🧘 **Relaxation**: Try gentle stretching or deep breathing exercises to ease tension.');
  }

  // Trigger-based tips
  if (log.triggers?.includes('Stress')) {
    tips.push('🧘‍♀️ **Stress Relief**: Practice meditation, progressive muscle relaxation, or take a warm bath to reduce stress.');
  }

  if (log.triggers?.includes('Lack of sleep')) {
    tips.push('😴 **Sleep**: Prioritize rest. A short 20-30 minute nap may help reduce migraine intensity.');
  }

  if (log.triggers?.includes('Bright lights')) {
    tips.push('🕶️ **Light Sensitivity**: Wear sunglasses and dim your screen brightness. Avoid bright environments.');
  }

  if (log.triggers?.includes('Loud noises')) {
    tips.push('🔇 **Noise Reduction**: Use earplugs or noise-canceling headphones. Keep your environment quiet.');
  }

  if (log.triggers?.includes('Dehydration')) {
    tips.push('💧 **Stay Hydrated**: Drink water consistently throughout the day to prevent future migraines.');
  }

  // Symptom-based tips
  if (log.symptoms?.includes('Nausea')) {
    tips.push('🤢 **Nausea Relief**: Ginger tea, peppermint, or ginger candies can help settle your stomach.');
  }

  if (log.symptoms?.includes('Light sensitivity')) {
    tips.push('🌑 **Light Management**: Keep lights low and avoid screens. Blue light can intensify light sensitivity.');
  }

  // Medication follow-up
  if (log.medication) {
    tips.push(`💊 **Medication**: You took ${log.medication}. Give it time to work (usually 30-60 minutes). Stay hydrated to help absorption.`);
  } else if (log.severity >= 6) {
    tips.push('💊 **Consider Medication**: If over-the-counter pain relievers are safe for you, they may help. Consult your doctor for recommendations.');
  }

  // Return top 4 tips
  return tips.slice(0, 4).join('\n\n');
}
