import { getGPUTier, type TierResult } from "detect-gpu";

export type GPUEvaluation = TierResult & {
  supported: boolean;
};

export async function evaluateGpu(): Promise<GPUEvaluation> {
  try {
    const tier = await getGPUTier();
    return {
      ...tier,
      supported: tier.tier >= 2
    };
  } catch (error) {
    console.warn("[gpu] detection failed, falling back to safe mode", error);
    return {
      tier: 0,
      type: "FALLBACK",
      isMobile: false,
      fps: 30,
      gpu: "unknown",
      supported: false
    };
  }
}
