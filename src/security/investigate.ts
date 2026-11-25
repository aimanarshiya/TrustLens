import type {
  Evidence,
  EvidenceSeverity,
  InvestigationInput,
  InvestigationResult,
  RiskLevel,
} from "./types.ts";

interface RuleSignal {
  id: string;
  title: string;
  detail: string;
  severity: EvidenceSeverity;
  score: number;
}

const shortenerHosts = new Set([
  "bit.ly",
  "cutt.ly",
  "is.gd",
  "ow.ly",
  "rb.gy",
  "rebrand.ly",
  "shorturl.at",
  "tinyurl.com",
  "t.ly",
]);

const knownBrandDomains = new Map([
  ["amazon", "amazon.com"],
  ["apple", "apple.com"],
  ["facebook", "facebook.com"],
  ["google", "google.com"],
  ["microsoft", "microsoft.com"],
  ["paypal", "paypal.com"],
]);

const textSignals: Array<Omit<RuleSignal, "detail"> & { pattern: RegExp; detail: string }> = [
  {
    id: "credential-request",
    title: "Sensitive credential request",
    detail: "The content asks for a password, one-time code, PIN, or account credential.",
    severity: "high",
    score: 35,
    pattern: /\b(password|passcode|one[- ]time (?:password|code)|\botp\b|pin number|security code|login code)\b/i,
  },
  {
    id: "urgent-pressure",
    title: "Urgency or threat language",
    detail: "Pressure language may be intended to stop the recipient from checking the request.",
    severity: "medium",
    score: 18,
    pattern: /\b(urgent|immediately|act now|within \d+ hours?|account (?:will be|is) (?:locked|suspended|closed)|final warning|last chance)\b/i,
  },
  {
    id: "payment-demand",
    title: "Unusual payment request",
    detail: "The message requests money, a transfer, gift cards, cryptocurrency, or an advance fee.",
    severity: "medium",
    score: 22,
    pattern: /\b(send (?:money|payment|funds)|wire transfer|gift cards?|crypto(?:currency)?|bitcoin|advance fee|processing fee|pay now|payment due)\b/i,
  },
  {
    id: "secrecy-request",
    title: "Request to keep the action secret",
    detail: "Secrecy requests can prevent independent verification.",
    severity: "medium",
    score: 18,
    pattern: /\b(keep (?:this|it) (?:a )?secret|do not tell|don't tell|confidential transfer|between us only)\b/i,
  },
  {
    id: "authority-claim",
    title: "Authority or emergency claim",
    detail: "The sender invokes authority or an emergency; verify through a separate trusted channel.",
    severity: "low",
    score: 12,
    pattern: /\b(police|tax department|government|customs|court|your boss|ceo|security team|support agent|grandchild|family emergency)\b/i,
  },
  {
    id: "job-fee",
    title: "Job offer fee or equipment payment",
    detail: "Legitimate employers generally do not require applicants to pay recruitment or equipment fees.",
    severity: "high",
    score: 28,
    pattern: /\b(job offer|hiring|recruit(?:er|ment)).{0,100}\b(fee|deposit|buy equipment|send money|payment)\b|\b(fee|deposit|buy equipment|send money|payment).{0,100}\b(job offer|hiring|recruit(?:er|ment))\b/i,
  },
];

function riskFromScore(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "medium";
  if (score > 0) return "low";
  return "inconclusive";
}

function addSignal(signals: RuleSignal[], signal: RuleSignal): void {
  if (!signals.some((item) => item.id === signal.id)) signals.push(signal);
}

function analyzeUrl(content: string, module: InvestigationInput["module"]): RuleSignal[] {
  const signals: RuleSignal[] = [];
  const value = content.trim();
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return [{
      id: "invalid-url",
      title: "URL could not be parsed",
      detail: "Enter a complete web address so TrustLens can inspect its structure.",
      severity: "info",
      score: 0,
    }];
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return [{
      id: "unsupported-scheme",
      title: "Unsupported address type",
      detail: "Only HTTP and HTTPS web addresses are analyzed. No connection was made.",
      severity: "info",
      score: 0,
    }];
  }

  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (parsed.protocol === "http:") {
    addSignal(signals, {
      id: "no-https",
      title: "Connection does not use HTTPS",
      detail: "The address uses HTTP, so transport encryption is not indicated by the URL.",
      severity: "medium",
      score: 20,
    });
  }
  if (parsed.username || parsed.password) {
    addSignal(signals, {
      id: "embedded-credentials",
      title: "Credentials embedded in address",
      detail: "The URL includes user information before the host, a pattern sometimes used to disguise the destination.",
      severity: "high",
      score: 35,
    });
  }
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(":")) {
    addSignal(signals, {
      id: "ip-host",
      title: "Address uses an IP host",
      detail: "The destination is an IP address rather than a recognizable domain name.",
      severity: "medium",
      score: 22,
    });
  }
  if (host.split(".").some((label) => label.startsWith("xn--"))) {
    addSignal(signals, {
      id: "idn-host",
      title: "Internationalized domain encoding",
      detail: "The hostname contains punycode. This can be legitimate, but lookalike characters are harder to inspect.",
      severity: "medium",
      score: 20,
    });
  }
  if (shortenerHosts.has(host)) {
    addSignal(signals, {
      id: "url-shortener",
      title: "URL shortener detected",
      detail: "The final destination is hidden by a shortening service. TrustLens did not follow the redirect.",
      severity: "medium",
      score: 20,
    });
  }
  if (host.split(".").length > 4) {
    addSignal(signals, {
      id: "many-subdomains",
      title: "Many hostname labels",
      detail: "The hostname contains several subdomain labels. Check which domain actually controls the destination.",
      severity: "low",
      score: 12,
    });
  }
  if (/[\u0400-\u04ff\u0370-\u03ff]/.test(host)) {
    addSignal(signals, {
      id: "non-latin-host",
      title: "Non-Latin hostname characters",
      detail: "The hostname contains non-Latin characters that can resemble familiar Latin letters.",
      severity: "medium",
      score: 22,
    });
  }
  for (const [brand, officialDomain] of knownBrandDomains) {
    const labels = host.split(".");
    const brandUsedAsLabel = labels.includes(brand);
    const officialHost = host === officialDomain || host.endsWith(`.${officialDomain}`);
    if (brandUsedAsLabel && !officialHost) {
      addSignal(signals, {
        id: `brand-lookalike-${brand}`,
        title: `Possible ${brand} domain mismatch`,
        detail: `The hostname contains “${brand}” but does not end with the expected ${officialDomain} domain. This is a heuristic, not a reputation lookup.`,
        severity: "high",
        score: 32,
      });
    }
  }
  if (/\b(login|sign[-_]?in|verify|wallet|secure|account|password|payment)\b/i.test(parsed.pathname)) {
    addSignal(signals, {
      id: "sensitive-path",
      title: "Sensitive action in URL path",
      detail: "The path refers to account access, verification, or payment. This alone does not establish that a site is malicious.",
      severity: "low",
      score: 10,
    });
  }
  if (parsed.search.length > 180 || [...parsed.searchParams].length > 8) {
    addSignal(signals, {
      id: "complex-query",
      title: "Unusually complex URL parameters",
      detail: "The URL contains a long query or many parameters; inspect unexpected tracking or redirect values carefully.",
      severity: "low",
      score: 10,
    });
  }

  if (module === "siteguard" && signals.length === 0) {
    addSignal(signals, {
      id: "site-content-unchecked",
      title: "Page content was not inspected",
      detail: "Only the address structure was checked. TrustLens did not load or inspect the website.",
      severity: "info",
      score: 0,
    });
  }
  return signals;
}

function analyzeText(content: string): RuleSignal[] {
  return textSignals
    .filter((signal) => signal.pattern.test(content))
    .map((signal) => ({
      id: signal.id,
      title: signal.title,
      detail: signal.detail,
      severity: signal.severity,
      score: signal.score,
    }));
}

function recommendationsFor(level: RiskLevel): string[] {
  switch (level) {
    case "critical":
    case "high":
      return [
        "Pause before opening links, replying, or sending money or credentials.",
        "Verify the sender using a contact method you already trust.",
        "If you already shared credentials, change them through the official site and contact the provider.",
      ];
    case "medium":
      return [
        "Verify the request independently before taking action.",
        "Do not share passwords, one-time codes, PINs, or payment details in response to an unexpected message.",
      ];
    case "low":
      return ["Check the sender and context independently before acting on an unexpected request."];
    case "inconclusive":
      return ["This check did not establish whether the content is safe. Verify the source and destination independently."];
  }
}

export function investigate(input: InvestigationInput): InvestigationResult {
  const content = input.content.trim();
  const signals = input.module === "linkguard" || input.module === "siteguard"
    ? analyzeUrl(content, input.module)
    : analyzeText(content);
  const score = Math.min(100, signals.reduce((total, signal) => total + signal.score, 0));
  const riskLevel = riskFromScore(score);
  const evidence: Evidence[] = signals.map((signal) => ({
    id: signal.id,
    title: signal.title,
    detail: signal.detail,
    severity: signal.severity,
  }));
  const confidence = evidence.length >= 3 ? "medium" : "low";

  return {
    investigationId: globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`,
    module: input.module,
    riskLevel,
    riskScore: score,
    confidence,
    summary: score === 0
      ? "The available checks did not find enough information to determine risk. This is not a safety verdict."
      : `${evidence.length} deterministic indicator${evidence.length === 1 ? "" : "s"} found; AI does not determine this risk score.`,
    evidence,
    recommendations: recommendationsFor(riskLevel),
    limitations: [
      "This is a heuristic check, not a malware scan or threat-intelligence lookup.",
      "TrustLens did not open URLs, follow redirects, or verify the identity of a sender.",
      "A low or inconclusive result does not mean the content is safe.",
    ],
    analyzedAt: new Date().toISOString(),
  };
}
