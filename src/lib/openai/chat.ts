import { openai, MODEL } from './client';
import { buildSystemPrompt } from './system-prompt';

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export async function generateReply(history: ChatMessage[]): Promise<string> {
  const systemPrompt = buildSystemPrompt();

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 600,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
    ],
  });

  return response.choices[0]?.message?.content?.trim() || 'Atsiprašau, neturėjau galimybės atsakyti. Pabandykite dar kartą.';
}

type SlotUpdate = {
  intent?: 'kondicionierius' | 'silumos_siurblys' | 'aptarnavimas' | 'kita';
  state?: 'discovery' | 'recommending' | 'collecting_contact' | 'done';
  slots?: Record<string, unknown>;
  ready_for_contact?: boolean;
};

export async function extractSlots(
  history: ChatMessage[],
  currentIntent: string | null,
  currentSlots: Record<string, unknown>,
): Promise<SlotUpdate> {
  const lastMessages = history.slice(-6);

  const prompt = `Analizuok pokalbį tarp Klimato Vektorių AI konsultanto ir kliento. Grąžink JSON su atnaujinta būsena.

Esamas intent: ${currentIntent || 'nežinoma'}
Esami slot'ai: ${JSON.stringify(currentSlots)}

POKALBIS (paskutinės žinutės):
${lastMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Grąžink JSON formatu:
{
  "intent": "kondicionierius" | "silumos_siurblys" | "aptarnavimas" | "kita" | null,
  "state": "discovery" | "recommending" | "collecting_contact" | "done",
  "slots": { ... naujausi visi žinomi laukai: plotas_m2, patalpos_tipas, funkcija, miestas, naujas_ar_renovacija, sildymas, zmoniu_skaicius, vardas, telefonas, email, susisiekimo_laikas ... },
  "ready_for_contact": true|false
}

TAISYKLĖS:
- "ready_for_contact" = true TIK kai klientas aiškiai sutiko, kad vadybininkas susisiektų, ir suprato, kad reikia palikti kontaktus.
- "state" = "collecting_contact" kai botas KLAUSIA vardo/telefono ir klientas pradėjo juos teikti.
- Įdėk slots TIK ką klientas EKSPLICITIŠKAI pasakė. Neišgalvok.
- Jei nieko naujo — grąžink esamus slots.
`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0]?.message?.content || '{}';
    return JSON.parse(text) as SlotUpdate;
  } catch (err) {
    console.error('extractSlots failed:', err);
    return {};
  }
}
