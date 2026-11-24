import { model } from './gemini.mjs';

// USD × 10⁹. El margen para un objetivo de 5 EUR se fija en un techo interno de 3,50 USD.
export const monthlyBudgetNanoUsd = 3_500_000_000;
export const rates = { [model]: { input: 250, output: 1500 } };
const modelInputLimit = 1_048_576;
const modelOutputLimit = 65_536;
export const maxCallNanoUsd = modelInputLimit * rates[model].input + modelOutputLimit * rates[model].output;

export class SpendingLimit extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

export function usageCost(modelId, usage) {
  const { promptTokenCount, candidatesTokenCount = 0, thoughtsTokenCount = 0, totalTokenCount } = usage || {};
  const output = candidatesTokenCount + thoughtsTokenCount;
  const counts = [promptTokenCount, candidatesTokenCount, thoughtsTokenCount, totalTokenCount];
  if (!counts.every(value => Number.isSafeInteger(value) && value >= 0) ||
      promptTokenCount < 1 || promptTokenCount > modelInputLimit || output > modelOutputLimit ||
      totalTokenCount !== promptTokenCount + output) return null;
  return promptTokenCount * rates[modelId].input + output * rates[modelId].output;
}
