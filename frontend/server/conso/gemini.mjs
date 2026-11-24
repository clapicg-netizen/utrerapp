export const model = 'gemini-3.1-flash-lite';

export function gemini(apiKey, metrics, selectedModel = model, onUsage) {
  return async ({ instructions, data, schema, search = false, output = 480 }) => {
    if (search) throw new Error('Search disabled in Preview');
    const text = JSON.stringify(data);
    if (Buffer.byteLength(text + instructions, 'utf8') > 6500) throw new Error('Input budget exceeded');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + selectedModel + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(8500),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: {
          candidateCount: 1, maxOutputTokens: output, temperature: 0.1, thinkingConfig: { thinkingLevel: 'MINIMAL' },
          ...(schema && { responseMimeType: 'application/json', responseSchema: schema }),
        },
      }),
    });
    metrics.calls++;
    if (!response.ok) throw new Error('Gemini unavailable');
    const result = await response.json();
    metrics.input += result.usageMetadata?.promptTokenCount || 0;
    metrics.output += (result.usageMetadata?.candidatesTokenCount || 0) + (result.usageMetadata?.thoughtsTokenCount || 0);
    await onUsage?.(result.usageMetadata);
    const candidate = result.candidates?.[0];
    const answer = candidate?.content?.parts?.filter(part => !part.thought).map(part => part.text || '').join('').trim();
    if (!answer || candidate.finishReason !== 'STOP') throw new Error('Gemini response unavailable');
    if (schema) return JSON.parse(answer);
    return { answer, grounding: candidate.groundingMetadata };
  };
}
