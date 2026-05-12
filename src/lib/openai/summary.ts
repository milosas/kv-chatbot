import { openai, MODEL } from './client';
import type { ChatMessage } from './chat';

export async function generateLeadSummary(
  history: ChatMessage[],
  slots: Record<string, unknown>,
): Promise<string> {
  const prompt = `Iš šio pokalbio parašyk TRUMPĄ santrauką vadybininkui lietuviškai (max 6-8 sakiniai).

POKALBIS:
${history.map((m) => `${m.role}: ${m.content}`).join('\n')}

SURINKTI SLOT'AI: ${JSON.stringify(slots)}

Sutalpink:
1. Ko klientas nori (kondicionierius / šilumos siurblys, kam)
2. Objekto info (plotas, tipas, miestas)
3. Specifiniai poreikiai jei buvo
4. Boto rekomenduoti modeliai (jei buvo)
5. Skubumas / pageidaujamas laikas

Rašyk konkrečiai, be marketing'inio fluff'o. Vadybininkui reikia faktų pokalbiui pradėti.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0]?.message?.content?.trim() || '(Santrauka nepasiekiama)';
  } catch (err) {
    console.error('generateLeadSummary failed:', err);
    return '(Santrauka nepasiekiama dėl klaidos)';
  }
}
