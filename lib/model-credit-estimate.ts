import { quoteApiCredits } from "./api-pricing.ts";
import type { RavsModel } from "./models.ts";

/** SERVER-ONLY. Never import this module from client components.
 * The public model catalog intentionally contains no provider tariff logic.
 */
export function estimateCredits(model: RavsModel, duration?: number, options: Record<string, unknown> = {}) {
  const defaults = Object.fromEntries((model.parameters || []).filter(p => p.default !== undefined).map(p => [p.name,p.default]));
  const input:Record<string,unknown> = { ...defaults, ...options };
  // No invented 5-second output duration for workflows without this parameter.
  if ((model.parameters || []).some(p => p.name === "duration")) {
    input.duration = duration ?? input.duration ?? model.minDuration;
  } else {
    delete input.duration;
  }
  return quoteApiCredits(model.modelId, input);
}
