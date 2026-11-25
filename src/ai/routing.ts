export type InferencePreference = "prefer_on_device" | "only_on_device";

export function inferencePreference(allowCloudFallback: boolean): InferencePreference {
  return allowCloudFallback ? "prefer_on_device" : "only_on_device";
}
