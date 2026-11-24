export const openaiModel = 'gpt-6-luna';

function jsonSchema(node) {
  const { type, properties, items, ...rest } = node;
  return {
    ...rest, type: type.toLowerCase(),
    ...(properties && {
      additionalProperties: false,
      properties: Object.fromEntries(Object.entries(properties).map(([name, value]) => [name, jsonSchema(value)])),
    }),
    ...(items && { items: jsonSchema(items) }),
  };
}

export function openai(apiKey, metrics, model, onUsage, region = 'global') {
  return async ({ instructions, data, schema, search, output }) => {
    if (search || !schema || output !== 250) throw new Error('Unsupported classification request');
    const input = JSON.stringify(data);
    if (Buffer.byteLength(input + instructions, 'utf8') > 6500) throw new Error('Input budget exceeded');
    const host = region === 'eu' ? 'eu.api.openai.com' : 'api.openai.com';
    const response = await fetch('https://' + host + '/v1/responses', {
      method: 'POST',
      redirect: 'error',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8500),
      body: JSON.stringify({
        model, input, instructions, store: false, service_tier: 'default',
        reasoning: { effort: 'none' }, max_output_tokens: output,
        text: { format: { type: 'json_schema', name: 'conso_intent', strict: true, schema: jsonSchema(schema) } },
      }),
    });
    metrics.calls++;
    if (!response.ok) throw new Error('OpenAI unavailable');
    const result = await response.json();
    const usage = result.usage;
    metrics.input += usage?.input_tokens || 0;
    metrics.output += usage?.output_tokens || 0;
    await onUsage(usage);
    if (result.status !== 'completed') throw new Error('Incomplete OpenAI response');
    const content = result.output?.filter(item => item.type === 'message').flatMap(item => item.content || []);
    if (!content?.length || content.some(part => part.type !== 'output_text')) throw new Error('OpenAI response unavailable');
    return JSON.parse(content.map(part => part.text).join(''));
  };
}
