import { loadEnvConfig } from "@next/env";
import { config, higgsfield } from "@higgsfield/client/v2";

async function main() {
  // Next's loader reads local environment files without printing their contents.
  loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
  if (!process.env.HF_CREDENTIALS?.match(/^[^:\s]+:[^:\s]+$/)) {
    console.error("BLOCKED: Enter HF_CREDENTIALS in .env.local locally (key-id:key-secret). Never paste the key into chat.");
    process.exitCode = 1;
    return;
  }
  config({ credentials: process.env.HF_CREDENTIALS, maxRetries: 0, timeout: 45000, maxPollTime: 1200000, pollInterval: 5000 });
  try {
    const result = await higgsfield.subscribe("bytedance/seedance-2.5/text-to-video", {
      input: { prompt: "A cinematic scene at sunset", duration: 5, resolution: "720p", aspect_ratio: "16:9", output_format: "mp4", generate_audio: true },
      withPolling: true,
    });
    const status = String(result.status);
    if (status !== "completed") {
      console.error(["failed", "canceled", "cancelled", "nsfw", "moderated"].includes(status) ? `Generation did not succeed: ${status}` : "Generation did not reach confirmed completion.");
      process.exitCode = 1;
      return;
    }
    const url = result.video?.url;
    if (!url || !/^https:\/\//.test(url)) {
      console.error("Completed response did not contain a valid HTTPS video URL.");
      process.exitCode = 1;
      return;
    }
    console.log(url);
  } catch {
    // SDK errors can contain request headers; never print the raw exception.
    console.error("Generation could not be verified. Check API access, balance, network, and request history locally.");
    process.exitCode = 1;
  }
}
void main();
