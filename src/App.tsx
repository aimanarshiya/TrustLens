import { useEffect, useMemo, useState, type FormEvent } from "react";
import { analyzeWithAI, safeAIError } from "./ai/analyze-with-ai.ts";
import { investigate } from "./security/investigate.ts";
import type { AIAnalysis, InvestigationResult, ModuleId } from "./security/types.ts";
import "./App.css";

type ViewId = "overview" | ModuleId | "privacy";
type DeviceAvailability = "checking" | "unavailable" | "downloadable" | "downloading" | "available" | "not-supported";

interface LanguageModelApi {
  availability(options: {
    expectedInputs: Array<{ type: "text"; languages: string[] }>;
    expectedOutputs: Array<{ type: "text"; languages: string[] }>;
  }): Promise<Exclude<DeviceAvailability, "checking" | "not-supported">>;
}

interface InvestigationEntry {
  result: InvestigationResult;
  aiAnalysis?: AIAnalysis;
  aiError?: string;
}

interface ModuleDefinition {
  id: ModuleId;
  name: string;
  shortName: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  symbol: string;
}

const modules: ModuleDefinition[] = [
  {
    id: "linkguard",
    name: "LinkGuard",
    shortName: "Links",
    description: "Inspect a web address for structural warning signs before you open it.",
    inputLabel: "Web address",
    placeholder: "https://example.com/login",
    symbol: "↗",
  },
  {
    id: "messageguard",
    name: "MessageGuard",
    shortName: "Messages",
    description: "Check a message for pressure tactics, credential requests, and payment demands.",
    inputLabel: "Message or email text",
    placeholder: "Paste the message you want to check. Remove any personal details first.",
    symbol: "≋",
  },
  {
    id: "siteguard",
    name: "SiteGuard",
    shortName: "Websites",
    description: "Review a website address for suspicious domain and path patterns.",
    inputLabel: "Website address",
    placeholder: "https://brand.example/sign-in",
    symbol: "◫",
  },
  {
    id: "payguard",
    name: "PayGuard",
    shortName: "Payments",
    description: "Review a payment request for coercion, advance fees, and sensitive-code requests.",
    inputLabel: "Payment request",
    placeholder: "Describe the request. Do not include account numbers or private payment details.",
    symbol: "⌁",
  },
  {
    id: "identityguard",
    name: "IdentityGuard",
    shortName: "Identity",
    description: "Look for impersonation and social-engineering signals in an unexpected contact.",
    inputLabel: "Claim or message",
    placeholder: "Paste the claim you want to review. Remove names, phone numbers, and other personal details.",
    symbol: "◎",
  },
];

const riskLabels: Record<InvestigationResult["riskLevel"], string> = {
  low: "Some caution",
  medium: "Review carefully",
  high: "High concern",
  critical: "Critical concern",
  inconclusive: "Inconclusive",
};

const firebaseConfigurationPresent = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY
  && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  && import.meta.env.VITE_FIREBASE_PROJECT_ID
  && import.meta.env.VITE_FIREBASE_AI_MODEL
  && import.meta.env.VITE_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY,
);

function getDeviceAvailability(): Promise<DeviceAvailability> {
  const browserWindow = window as Window & { LanguageModel?: LanguageModelApi };
  if (!browserWindow.LanguageModel) return Promise.resolve("not-supported");

  return browserWindow.LanguageModel.availability({
    expectedInputs: [{ type: "text", languages: ["en"] }],
    expectedOutputs: [{ type: "text", languages: ["en"] }],
  }).catch(() => "unavailable");
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function App() {
  const [view, setView] = useState<ViewId>("overview");
  const [content, setContent] = useState("");
  const [allowCloudFallback, setAllowCloudFallback] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [deviceAvailability, setDeviceAvailability] = useState<DeviceAvailability>("checking");
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [entries, setEntries] = useState<InvestigationEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<InvestigationEntry | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let current = true;
    void getDeviceAvailability().then((availability) => {
      if (current) setDeviceAvailability(availability);
    });
    return () => { current = false; };
  }, []);

  const activeModule = modules.find((item) => item.id === view);
  const counts = useMemo(() => entries.reduce<Record<string, number>>((current, item) => {
    current[item.result.riskLevel] = (current[item.result.riskLevel] ?? 0) + 1;
    return current;
  }, {}), [entries]);

  async function handleAnalyze(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!activeModule) return;
    const trimmed = content.trim();
    if (trimmed.length < 5) {
      setFormError("Add at least five characters to run a useful check.");
      return;
    }
    if (trimmed.length > 5_000) {
      setFormError("Keep the submission under 5,000 characters.");
      return;
    }

    setFormError("");
    setIsRunning(true);
    setDownloadProgress(null);
    const cloudAllowedForThisCheck = allowCloudFallback;
    setAllowCloudFallback(false);
    const result = investigate({ module: activeModule.id, content: trimmed });
    const initialEntry: InvestigationEntry = { result };
    setActiveEntry(initialEntry);
    setEntries((current) => [initialEntry, ...current].slice(0, 8));

    try {
      const aiAnalysis = await analyzeWithAI(
        activeModule.id,
        trimmed,
        cloudAllowedForThisCheck,
        (progress) => setDownloadProgress(Math.round(progress * 100)),
      );
      const completed: InvestigationEntry = { result, aiAnalysis };
      setActiveEntry(completed);
      setEntries((current) => current.map((item) => item.result.investigationId === result.investigationId ? completed : item));
    } catch (error) {
      const failed: InvestigationEntry = {
        result,
        aiError: safeAIError(error),
      };
      setActiveEntry(failed);
      setEntries((current) => current.map((item) => item.result.investigationId === result.investigationId ? failed : item));
    } finally {
      setIsRunning(false);
      setDownloadProgress(null);
    }
  }

  function chooseView(nextView: ViewId): void {
    setView(nextView);
    setContent("");
    setActiveEntry(null);
    setFormError("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <button className="brand-lockup" type="button" onClick={() => chooseView("overview")} aria-label="TrustLens overview">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy"><strong>trustlens</strong><small>PROGRESSIVE HYBRID AI SECURITY</small></span>
        </button>

        <div className="side-section-label">WORKSPACE</div>
        <nav className="main-nav">
          <button className={`nav-item ${view === "overview" ? "selected" : ""}`} type="button" onClick={() => chooseView("overview")}>
            <span className="nav-icon">⌂</span><span>Overview</span>
          </button>
          {modules.map((item) => (
            <button className={`nav-item ${view === item.id ? "selected" : ""}`} type="button" key={item.id} onClick={() => chooseView(item.id)}>
              <span className="nav-icon">{item.symbol}</span><span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="privacy-card">
          <span className="privacy-icon" aria-hidden="true">◇</span>
          <strong>Your data stays yours</strong>
          <p>Checks run in your browser. Cloud AI is optional and off until you allow it.</p>
          <button type="button" onClick={() => chooseView("privacy")}>Privacy controls <span aria-hidden="true">→</span></button>
        </div>
        <div className="profile-row"><span className="avatar">TL</span><span><strong>Local workspace</strong><small>No account connected</small></span><span className="profile-dot" /></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>TrustLens</span><span className="crumb-separator">/</span><strong>{activeModule?.name ?? (view === "privacy" ? "Privacy controls" : "Overview")}</strong></div>
          <div className="topbar-status"><span className={`status-dot ${deviceAvailability === "available" ? "is-ready" : ""}`} />
            <span>{deviceLabel(deviceAvailability)}</span><span className="topbar-divider" />
            <button type="button" className="privacy-link" onClick={() => chooseView("privacy")}>Privacy</button>
          </div>
        </header>

        <div className="page-content">
          {view === "overview" && (
            <OverviewView
              entries={entries}
              counts={counts}
              deviceAvailability={deviceAvailability}
              firebaseReady={firebaseConfigurationPresent}
              onOpenModule={(module) => chooseView(module)}
              onOpenEntry={setActiveEntry}
              activeEntry={activeEntry}
            />
          )}
          {activeModule && (
            <ModuleView
              module={activeModule}
              content={content}
              setContent={setContent}
              allowCloudFallback={allowCloudFallback}
              setAllowCloudFallback={setAllowCloudFallback}
              isRunning={isRunning}
              downloadProgress={downloadProgress}
              formError={formError}
              activeEntry={activeEntry}
              onSubmit={handleAnalyze}
              deviceAvailability={deviceAvailability}
              firebaseReady={firebaseConfigurationPresent}
            />
          )}
          {view === "privacy" && (
            <PrivacyView allowCloudFallback={allowCloudFallback} setAllowCloudFallback={setAllowCloudFallback} firebaseReady={firebaseConfigurationPresent} />
          )}
        </div>
        <footer className="page-footer"><span>TrustLens is a decision aid, not a guarantee of safety.</span><span>Checks are heuristic and may miss threats.</span></footer>
      </main>
    </div>
  );
}

function deviceLabel(availability: DeviceAvailability): string {
  switch (availability) {
    case "available": return "On-device model available";
    case "downloadable": return "On-device model ready to download";
    case "downloading": return "On-device model downloading";
    case "checking": return "Checking this device";
    case "not-supported": return "On-device model not supported here";
    case "unavailable": return "On-device model unavailable";
  }
}

interface OverviewViewProps {
  entries: InvestigationEntry[];
  counts: Record<string, number>;
  deviceAvailability: DeviceAvailability;
  firebaseReady: boolean;
  onOpenModule: (module: ModuleId) => void;
  onOpenEntry: (entry: InvestigationEntry | null) => void;
  activeEntry: InvestigationEntry | null;
}

function OverviewView({ entries, counts, deviceAvailability, firebaseReady, onOpenModule, onOpenEntry, activeEntry }: OverviewViewProps) {
  return (
    <>
      <div className="eyebrow"><span className="eyebrow-line" /> SECURITY WORKSPACE <span className="eyebrow-badge">BETA</span></div>
      <section className="welcome-row">
        <div><h1>Make a safer call.</h1><p>Check a suspicious link, message, or request before you act.</p></div>
        <div className="overview-mark" aria-hidden="true"><span className="overview-orbit orbit-one" /><span className="overview-orbit orbit-two" /><span className="overview-core">T</span></div>
      </section>

      <section className="signal-panel" aria-label="Security overview">
        <div className="signal-panel-head"><div><span className="section-kicker">YOUR SECURITY SNAPSHOT</span><h2>Overview</h2></div><span className="live-label"><i /> LIVE WORKSPACE</span></div>
        <div className="metric-grid">
          <Metric label="Checks this session" value={String(entries.length)} note="Results stay in this tab" symbol="↗" />
          <Metric label="High or critical" value={String((counts.high ?? 0) + (counts.critical ?? 0))} note="From deterministic checks" symbol="!" alert />
          <Metric label="AI explanations" value={String(entries.filter((entry) => entry.aiAnalysis).length)} note="Actual model responses only" symbol="✳" />
          <Metric label="Local model" value={deviceAvailability === "available" ? "Ready" : "Check"} note={deviceLabel(deviceAvailability)} symbol="⌘" />
        </div>
      </section>

      <section className="module-section">
        <div className="section-heading"><div><span className="section-kicker">FIVE WAYS TO INVESTIGATE</span><h2>Choose a security check</h2></div><span className="quiet-count">No content is saved to an account</span></div>
        <div className="module-grid">
          {modules.map((module, index) => (
            <button className="module-card" type="button" key={module.id} onClick={() => onOpenModule(module.id)}>
              <span className={`module-symbol symbol-${index}`}>{module.symbol}</span>
              <span className="module-card-copy"><strong>{module.name}</strong><small>{module.description}</small></span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="recent-panel">
          <div className="section-heading compact"><div><span className="section-kicker">THIS SESSION</span><h2>Recent checks</h2></div><span className="quiet-count">{entries.length} / 8</span></div>
          {entries.length === 0 ? (
            <div className="empty-recent"><span className="empty-orbit">◎</span><div><strong>No checks yet</strong><p>Your recent checks will appear here while this tab stays open.</p></div></div>
          ) : (
            <div className="recent-list">{entries.map((entry) => (
              <button className="recent-item" type="button" key={entry.result.investigationId} onClick={() => onOpenEntry(entry)}>
                <span className="recent-symbol">{modules.find((item) => item.id === entry.result.module)?.symbol}</span>
                <span className="recent-copy"><strong>{modules.find((item) => item.id === entry.result.module)?.name}</strong><small>{entry.result.evidence.length} signal{entry.result.evidence.length === 1 ? "" : "s"} · {formatTime(entry.result.analyzedAt)}</small></span>
                <RiskPill level={entry.result.riskLevel} />
              </button>
            ))}</div>
          )}
        </div>
        <div className="hybrid-panel">
          <div className="section-heading compact"><div><span className="section-kicker">INFERENCE STATUS</span><h2>Hybrid AI</h2></div><span className="sparkle">✳</span></div>
          <StatusLine label="On-device" value={availabilityLabel(deviceAvailability)} positive={deviceAvailability === "available"} />
          <StatusLine label="Firebase AI Logic" value={firebaseReady ? "Environment present · unverified" : "Setup needed"} />
          <StatusLine label="Cloud fallback" value="Consent required" />
          <p className="hybrid-footnote">Model availability depends on Chrome version, device capability, and local model download. The source is reported from each Firebase response.</p>
        </div>
      </section>
      {activeEntry && <ResultDialog entry={activeEntry} onClose={() => onOpenEntry(null)} />}
    </>
  );
}

interface MetricProps { label: string; value: string; note: string; symbol: string; alert?: boolean }
function Metric({ label, value, note, symbol, alert = false }: MetricProps) {
  return <div className="metric"><div className={`metric-symbol ${alert ? "metric-alert" : ""}`}>{symbol}</div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><small>{note}</small></div>;
}

function availabilityLabel(availability: DeviceAvailability): string {
  if (availability === "available") return "Available";
  if (availability === "checking") return "Checking";
  if (availability === "not-supported") return "Unsupported browser";
  return "Not ready";
}

function StatusLine({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return <div className="status-line"><span>{label}</span><strong className={positive ? "positive" : ""}><i />{value}</strong></div>;
}

interface ModuleViewProps {
  module: ModuleDefinition;
  content: string;
  setContent: (value: string) => void;
  allowCloudFallback: boolean;
  setAllowCloudFallback: (value: boolean) => void;
  isRunning: boolean;
  downloadProgress: number | null;
  formError: string;
  activeEntry: InvestigationEntry | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  deviceAvailability: DeviceAvailability;
  firebaseReady: boolean;
}

function ModuleView(props: ModuleViewProps) {
  const { module, content, setContent, allowCloudFallback, setAllowCloudFallback, isRunning, downloadProgress, formError, activeEntry, onSubmit, deviceAvailability, firebaseReady } = props;
  const isUrlModule = module.id === "linkguard" || module.id === "siteguard";
  return (
    <>
      <div className="eyebrow"><span className="eyebrow-line" /> SECURITY MODULE <span className="eyebrow-badge">LOCAL-FIRST</span></div>
      <section className="module-intro"><div className="module-intro-icon">{module.symbol}</div><div><h1>{module.name}</h1><p>{module.description}</p></div></section>
      <div className="investigation-layout">
        <section className="form-panel">
          <div className="panel-title"><div><span className="section-kicker">NEW INVESTIGATION</span><h2>What would you like to check?</h2></div><span className="step-marker">01 <i /> 02</span></div>
          <form onSubmit={(event) => void onSubmit(event)}>
            <label className="input-label" htmlFor="investigation-content">{module.inputLabel}<span>Required</span></label>
            {isUrlModule ? (
              <input id="investigation-content" className="url-input" type="text" inputMode="url" autoComplete="url" maxLength={5_000} value={content} onChange={(event) => setContent(event.target.value)} placeholder={module.placeholder} aria-describedby="input-help" />
            ) : (
              <textarea id="investigation-content" className="message-input" maxLength={5_000} value={content} onChange={(event) => setContent(event.target.value)} placeholder={module.placeholder} aria-describedby="input-help" />
            )}
            <div className="input-foot"><span id="input-help">{isUrlModule ? "The site will not be opened or contacted." : "Avoid pasting personal, financial, or account information."}</span><span>{content.length.toLocaleString()} / 5,000</span></div>
            <div className="ai-consent">
              <label className="toggle-row"><span className={`toggle ${allowCloudFallback ? "on" : ""}`}><input type="checkbox" checked={allowCloudFallback} onChange={(event) => setAllowCloudFallback(event.target.checked)} /><i /></span><span><strong>Allow cloud fallback for this check</strong><small>When enabled, content may be sent to Firebase AI Logic if on-device inference is unavailable.</small></span></label>
              <span className="consent-state">{allowCloudFallback ? "CLOUD ALLOWED" : "LOCAL ONLY"}</span>
            </div>
            <button className="analyze-button" type="submit" disabled={isRunning || !content.trim()}><span>{isRunning ? "Analyzing securely…" : "Run security check"}</span><span aria-hidden="true">↗</span></button>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            {downloadProgress !== null && <div className="download-progress" role="status">Preparing on-device model: {downloadProgress}%</div>}
          </form>
          <div className="form-assurance"><span>◇</span><p>Deterministic checks run in your browser. TrustLens does not open links, submit forms, or save the original content.</p></div>
        </section>

        <aside className="module-side-panel">
          <div className="section-kicker">BEFORE YOU BEGIN</div>
          <h3>What this check can tell you</h3>
          <p>{moduleDescription(module.id)}</p>
          <div className="side-divider" />
          <StatusLine label="On-device model" value={availabilityLabel(deviceAvailability)} positive={deviceAvailability === "available"} />
          <StatusLine label="Firebase AI Logic" value={firebaseReady ? "Environment present · unverified" : "Setup needed"} />
          <div className="caution-note"><span>i</span><p>AI output is an explanation aid, not threat intelligence. Risk level comes from deterministic checks and may be inconclusive.</p></div>
        </aside>
      </div>
      {activeEntry && <ResultPanel entry={activeEntry} isRunning={isRunning} />}
    </>
  );
}

function moduleDescription(module: ModuleId): string {
  switch (module) {
    case "linkguard": return "Looks at URL structure, transport scheme, host patterns, and suspicious credential placement. It does not follow redirects or query a reputation service.";
    case "messageguard": return "Looks for pressure language, credential requests, payment demands, secrecy, and certain impersonation signals in the text you provide.";
    case "siteguard": return "Reviews the address only. It does not load the site, inspect its certificate, scan page content, or submit information.";
    case "payguard": return "Looks for coercion, advance-fee requests, and requests for sensitive codes. It never initiates or authorizes payment.";
    case "identityguard": return "Looks for urgency, authority, secrecy, or credential patterns. Confirm identity through a known trusted channel.";
  }
}

function ResultPanel({ entry, isRunning }: { entry: InvestigationEntry; isRunning: boolean }) {
  const { result, aiAnalysis, aiError } = entry;
  return (
    <section className="result-panel" aria-live="polite" aria-busy={isRunning}>
      <div className="result-head"><div><span className="section-kicker">INVESTIGATION RESULT</span><h2>What we found</h2></div><RiskPill level={result.riskLevel} /></div>
      <div className="score-row"><div className={`score-ring score-${result.riskLevel}`}><strong>{result.riskScore}</strong><small>/ 100</small></div><div className="score-copy"><strong>{riskLabels[result.riskLevel]}</strong><p>{result.summary}</p><small>Rule-based score · {result.confidence} confidence · {formatTime(result.analyzedAt)}</small></div></div>
      {result.evidence.length === 0 ? <div className="no-evidence"><span>○</span><p>No deterministic warning signs matched. This check is inconclusive and does not establish that the content is safe.</p></div> : (
        <div className="evidence-list"><h3>Signals to review <span>{result.evidence.length}</span></h3>{result.evidence.map((item) => <div className="evidence-item" key={item.id}><span className={`evidence-marker severity-${item.severity}`} /><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}</div>
      )}
      <div className="recommendation-block"><h3>Safer next steps</h3><ul>{result.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></div>
      {isRunning && <div className="ai-pending"><span className="loader" />Waiting for a validated AI explanation…</div>}
      {aiAnalysis && <div className="ai-explanation"><div className="ai-title"><span>✳</span><div><h3>AI explanation</h3><small>Actual source: {aiAnalysis.inferenceSource === "on_device" ? "On-device" : "Firebase cloud"} · {aiAnalysis.durationMs} ms</small></div></div><p>{aiAnalysis.explanation.summary}</p>{aiAnalysis.explanation.recommendations.length > 0 && <ul>{aiAnalysis.explanation.recommendations.map((item) => <li key={item}>{item}</li>)}</ul>}{aiAnalysis.explanation.uncertainties.length > 0 && <div className="uncertainty"><strong>Limitations from the model</strong>{aiAnalysis.explanation.uncertainties.map((item) => <p key={item}>{item}</p>)}</div>}</div>}
      {aiError && <div className="ai-unavailable" role="status"><strong>AI explanation unavailable</strong><p>{aiError}</p><small>The deterministic result above is still available; no AI result has been fabricated.</small></div>}
      <div className="limitations-list"><strong>Limits of this result</strong>{result.limitations.map((item) => <p key={item}>{item}</p>)}</div>
    </section>
  );
}

function RiskPill({ level }: { level: InvestigationResult["riskLevel"] }) {
  return <span className={`risk-pill risk-${level}`}><i />{riskLabels[level]}</span>;
}

function PrivacyView({ allowCloudFallback, setAllowCloudFallback, firebaseReady }: { allowCloudFallback: boolean; setAllowCloudFallback: (value: boolean) => void; firebaseReady: boolean }) {
  return (
    <>
      <div className="eyebrow"><span className="eyebrow-line" /> TRUST BY DESIGN</div>
      <section className="privacy-intro"><span className="privacy-hero-icon">◇</span><h1>Privacy controls</h1><p>Security checks should not create a new privacy problem. These controls explain what leaves your browser.</p></section>
      <div className="privacy-settings">
        <div className="privacy-setting"><div><span className="setting-tag">DEFAULT</span><h2>Local deterministic checks</h2><p>URL and message patterns are inspected in this tab. The original content is not stored in local storage, sent to a backend, or included in recent-check history.</p></div><strong className="setting-value"><i /> Always on</strong></div>
        <div className="privacy-setting"><div><span className="setting-tag">OPTIONAL</span><h2>Firebase AI cloud fallback</h2><p>If allowed, submitted content may be sent to Firebase AI Logic when on-device inference is unavailable. Firebase project setup and App Check must be configured first.</p></div><label className="setting-toggle"><span className={`toggle ${allowCloudFallback ? "on" : ""}`}><input type="checkbox" checked={allowCloudFallback} onChange={(event) => setAllowCloudFallback(event.target.checked)} /><i /></span><span>{allowCloudFallback ? "Allowed for the next check" : "Off"}</span></label></div>
        <div className="privacy-setting"><div><span className="setting-tag">STATUS</span><h2>Firebase configuration</h2><p>Environment values are present, but App Check token acceptance and Firebase AI Logic access have not been verified.</p></div><strong className="setting-value value-pending"><i />{firebaseReady ? "Environment present · unverified" : "Setup required"}</strong></div>
      </div>
      <div className="privacy-disclaimer"><strong>What the current prototype does not do</strong><p>It does not crawl websites, query threat-intelligence feeds, collect account data, or claim that content is safe based on an AI response.</p></div>
    </>
  );
}

function ResultDialog({ entry, onClose }: { entry: InvestigationEntry; onClose: () => void }) {
  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section className="result-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close result">×</button>
        <span className="section-kicker">PREVIOUS CHECK</span><h2 id="dialog-title">{modules.find((item) => item.id === entry.result.module)?.name}</h2>
        <RiskPill level={entry.result.riskLevel} /><p className="dialog-summary">{entry.result.summary}</p>
        <strong>{entry.result.evidence.length} rule-based signals</strong>
        {entry.aiAnalysis && <p className="dialog-source">AI source: {entry.aiAnalysis.inferenceSource === "on_device" ? "on-device" : "Firebase cloud"}</p>}
        {entry.aiError && <p className="dialog-source">AI explanation unavailable for this check.</p>}
      </section>
    </div>
  );
}

export default App;
