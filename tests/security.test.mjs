import test from "node:test";
import assert from "node:assert/strict";
import { investigate } from "../src/security/investigate.ts";
import { validateModelExplanation } from "../src/security/model-output.ts";
import { inferencePreference } from "../src/ai/routing.ts";

test("clean-looking URLs remain inconclusive instead of being called safe", () => {
  const result = investigate({ module: "linkguard", content: "https://example.com/" });
  assert.equal(result.riskLevel, "inconclusive");
  assert.match(result.summary, /not a safety verdict/i);
  assert.equal(result.riskScore, 0);
});

test("URL analysis flags an IP host and never performs a network request", () => {
  const result = investigate({ module: "linkguard", content: "http://192.0.2.1/login" });
  assert.ok(result.evidence.some((item) => item.id === "ip-host"));
  assert.ok(result.evidence.some((item) => item.id === "no-https"));
  assert.equal(result.riskLevel, "medium");
});

test("URL analysis catches a brand label outside its expected domain", () => {
  const result = investigate({ module: "siteguard", content: "https://paypal.com.evil.example/sign-in" });
  assert.ok(result.evidence.some((item) => item.id === "brand-lookalike-paypal"));
  assert.ok(result.evidence.some((item) => item.id === "sensitive-path"));
  assert.ok(result.limitations.some((item) => /did not open URLs/i.test(item)));
});

test("non-web schemes are rejected without being labelled malicious", () => {
  const result = investigate({ module: "linkguard", content: "javascript:alert(1)" });
  assert.equal(result.riskLevel, "inconclusive");
  assert.ok(result.evidence.some((item) => item.id === "unsupported-scheme"));
});

test("text analysis detects credential and pressure signals", () => {
  const result = investigate({
    module: "messageguard",
    content: "Urgent: your account will be locked. Reply with your one-time code immediately.",
  });
  assert.equal(result.riskLevel, "medium");
  assert.ok(result.evidence.some((item) => item.id === "credential-request"));
  assert.ok(result.evidence.some((item) => item.id === "urgent-pressure"));
});

test("payment requests for secrets and advance fees are elevated", () => {
  const result = investigate({
    module: "payguard",
    content: "Pay the advance fee with gift cards and send the PIN number now.",
  });
  assert.equal(result.riskLevel, "high");
  assert.ok(result.evidence.some((item) => item.id === "payment-demand"));
  assert.ok(result.evidence.some((item) => item.id === "credential-request"));
});

test("invalid URLs return an inconclusive result with a parsing limitation", () => {
  const result = investigate({ module: "siteguard", content: "https://" });
  assert.equal(result.riskLevel, "inconclusive");
  assert.ok(result.evidence.some((item) => item.id === "invalid-url"));
});

test("AI output validator accepts expected fields and rejects malformed output", () => {
  assert.deepEqual(validateModelExplanation({
    summary: "The text uses urgency and requests a credential.",
    recommendations: ["Verify the sender."],
    uncertainties: ["The sender was not verified."],
  }), {
    summary: "The text uses urgency and requests a credential.",
    recommendations: ["Verify the sender."],
    uncertainties: ["The sender was not verified."],
  });
  assert.equal(validateModelExplanation({ summary: "Looks safe", recommendations: [2], uncertainties: [] }), null);
  assert.equal(validateModelExplanation(null), null);
});

test("cloud fallback requires per-check consent", () => {
  assert.equal(inferencePreference(false), "only_on_device");
  assert.equal(inferencePreference(true), "prefer_on_device");
});
