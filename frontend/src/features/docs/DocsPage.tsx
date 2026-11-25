import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ArrowUp, Check, ChevronRight, Copy, ExternalLink,
  FileCode2, Menu, ShieldCheck, X,
} from "lucide-react";
import { GithubLogo } from "../../components/common/GithubLogo";
import "../../styles/docs.css";

const GITHUB_URL = "https://github.com/kasperzkid/Arqon";
const API_PREFIX = "/api/v1";

const sections = [
  { group: "Overview", links: [{ id: "introduction", label: "Introduction" }, { id: "quickstart", label: "Quick start" }, { id: "how-it-works", label: "How Arqon works" }] },
  { group: "Platform", links: [{ id: "wallet-analysis", label: "Wallet analysis" }, { id: "detection", label: "Detection rules" }, { id: "privacy", label: "Privacy & limitations" }] },
  { group: "Reference", links: [{ id: "api-reference", label: "API reference" }, { id: "responses-errors", label: "Responses & errors" }, { id: "configuration", label: "Configuration" }] },
  { group: "Contribute", links: [{ id: "development", label: "Local development" }, { id: "open-source", label: "Open source" }] },
];

function CodeBlock({ title, language, code }: { title: string; language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return <div className="docs-code-block">
    <div className="docs-code-head"><span><FileCode2 size={14}/>{title}</span><div><small>{language}</small><button onClick={copyCode} aria-label={`Copy ${title} example`}>{copied ? <Check size={13}/> : <Copy size={13}/>}<span>{copied ? "Copied" : "Copy"}</span></button></div></div>
    <pre><code>{code}</code></pre>
  </div>;
}

function DocsHeader({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  return <header className="docs-header">
    <Link className="docs-brand" to="/" aria-label="Arqon home"><span className="docs-brand-mark">A</span><b>arqon</b><i/> <span>Docs</span></Link>
    <div className="docs-header-actions"><a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Arqon on GitHub"><GithubLogo size={17}/><span>GitHub</span><ExternalLink size={12}/></a><Link className="docs-launch" to="/#analyzer">Launch analyzer <ArrowRight size={14}/></Link></div>
    <button className="docs-menu-button" onClick={onMenu} aria-label={menuOpen ? "Close documentation navigation" : "Open documentation navigation"} aria-controls="docs-sidebar" aria-expanded={menuOpen}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
  </header>;
}

function DocsSidebar({ active, open, onNavigate }: { active: string; open: boolean; onNavigate: () => void }) {
  return <aside id="docs-sidebar" className={`docs-sidebar ${open ? "docs-sidebar-open" : ""}`} aria-label="Documentation contents">
    <div className="docs-sidebar-label">DOCUMENTATION</div>
    {sections.map((section) => <div className="docs-nav-group" key={section.group}>
      <h2>{section.group}</h2>
      {section.links.map(({ id, label }) => <a key={id} className={active === id ? "docs-nav-active" : ""} href={`#${id}`} onClick={onNavigate}>{label}</a>)}
    </div>)}
  </aside>;
}

export default function DocsPage() {
  const [active, setActive] = useState("introduction");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const targets = sections.flatMap(({ links }) => links.map(({ id }) => document.getElementById(id)).filter((node): node is HTMLElement => node !== null));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]?.target.id) setActive(visible[0].target.id);
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return <div className="docs-page" id="docs-top">
    <DocsHeader menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} />
    {menuOpen && <button className="docs-mobile-backdrop" aria-label="Close documentation navigation" onClick={() => setMenuOpen(false)}><X/></button>}
    <div className="docs-layout">
      <DocsSidebar active={active} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <main className="docs-main">
        <div className="docs-breadcrumb"><Link to="/">Arqon</Link><ChevronRight size={13}/><span>Documentation</span></div>
        <section className="docs-hero" id="introduction" data-doc-section>
          <h1>Understand how<br/><span>Arqon works.</span></h1>
          <p>Setup, architecture, API usage, and detection behavior for Arqon’s open-source Solana security analysis platform.</p>
          <div className="docs-hero-meta"><span><i/> API v1</span><span>Solana mainnet-beta</span><span>MIT License</span></div>
        </section>

        <section className="docs-section" id="quickstart" data-doc-section>
          <SectionNumber number="01" label="GETTING STARTED" />
          <h2>Quick start</h2>
          <p>Run the API and frontend locally, then submit a public address. Arqon reads on-chain data only; a wallet connection is not required.</p>
          <div className="docs-callout"><ShieldCheck size={17}/><p><b>Read-only:</b> Arqon validates public keys and requests public Solana RPC data. It never asks for a seed phrase, private key, wallet connection, or signature.</p></div>
          <CodeBlock title="Start the backend" language="shell" code={`cd backend\npython3 -m venv .venv\nsource .venv/bin/activate\npip install -r requirements.txt\npython -m uvicorn app.main:app --reload --port 8000`} />
          <CodeBlock title="Start the frontend" language="shell" code={`cd frontend\nnpm install\nnpm run dev`} />
          <p className="docs-note">The Vite development server proxies <code>/api/*</code> to <code>http://127.0.0.1:8000</code> by default. Open the printed frontend URL, usually <code>http://localhost:5173</code>.</p>
        </section>

        <section className="docs-section" id="how-it-works" data-doc-section>
          <SectionNumber number="02" label="SYSTEM OVERVIEW" />
          <h2>How Arqon works</h2>
          <p>An investigation follows a small, inspectable path from an address to normalized activity and deterministic rule output.</p>
          <div className="docs-flow">
            <article><span>01</span><b>Validate</b><p>Solders checks that the submitted string is a valid Solana public key.</p></article><i><ArrowRight size={16}/></i>
            <article><span>02</span><b>Collect</b><p>The provider fetches recent signatures, transaction details, and the account’s SOL balance.</p></article><i><ArrowRight size={16}/></i>
            <article><span>03</span><b>Normalize</b><p>Transaction metadata is converted to a stable schema for analysis and display.</p></article><i><ArrowRight size={16}/></i>
            <article><span>04</span><b>Evaluate</b><p>Registered rules inspect normalized activity and return findings with supporting evidence.</p></article>
          </div>
          <CodeBlock title="Current response path" language="text" code={`Browser → POST /api/v1/wallet/validate\n        → GET  /api/v1/wallet/activity\nAPI     → Solana JSON-RPC (read-only)\n        → normalize transactions → evaluate rules`} />
        </section>

        <section className="docs-section" id="wallet-analysis" data-doc-section>
          <SectionNumber number="03" label="WALLET ANALYSIS" />
          <h2>Analyze a public address</h2>
          <p>The analyzer first validates an address, then requests recent wallet activity. The current UI requests five recent transactions; the API accepts a configurable limit from 1 to 100.</p>
          <h3>Validate the address</h3>
          <CodeBlock title="Validate a Solana public key" language="curl" code={`curl -X POST http://localhost:8000/api/v1/wallet/validate \\\n  -H 'Content-Type: application/json' \\\n  -d '{"address":"9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB"}'`} />
          <CodeBlock title="Validation response" language="json" code={`{\n  "valid": true,\n  "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB",\n  "is_public_address": true\n}`} />
          <h3>Fetch activity and findings</h3>
          <CodeBlock title="Request recent wallet activity" language="curl" code={`curl 'http://localhost:8000/api/v1/wallet/activity?address=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB&limit=20'`} />
          <CodeBlock title="Fetch from JavaScript" language="typescript" code={`const api = "/api/v1";\nconst address = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB";\n\nconst validation = await fetch(api + "/wallet/validate", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ address }),\n});\nif (!validation.ok) throw new Error("Address validation failed");\n\nconst url = api + "/wallet/activity?address=" +\n  encodeURIComponent(address) + "&limit=20";\nconst activity = await fetch(url);\nif (!activity.ok) throw new Error("Activity request failed");\nconst report = await activity.json();\nconsole.log(report.items, report.findings);`} />
          <p className="docs-note">The example address is used to show request shape. RPC availability, address activity, and returned data depend on the configured Solana provider.</p>
        </section>

        <section className="docs-section" id="detection" data-doc-section>
          <SectionNumber number="04" label="DETECTION" />
          <h2>Deterministic rules, traceable output</h2>
          <p>Arqon’s detection engine evaluates explicit rules against normalized transaction activity. It does not use artificial intelligence or machine learning.</p>
          <div className="docs-rule-card"><div><span className="docs-rule-id">PFX-001</span><span className="docs-severity">MEDIUM</span></div><h3>High-frequency activity</h3><p>Triggers when more than five timestamped transactions occur within a 600-second window.</p><dl><div><dt>Evidence returned</dt><dd>Observed count, time bounds, supporting signatures</dd></div><div><dt>Interpretation</dt><dd>A review signal; it does not establish malicious intent.</dd></div></dl></div>
          <h3>Rule evaluation example</h3>
          <CodeBlock title="Detection logic (simplified)" language="python" code={`WINDOW_SECONDS = 600\nTHRESHOLD = 5\n\n# Transactions without timestamps are excluded.\nfor window in rolling_windows(timestamped_items, WINDOW_SECONDS):\n    if len(window) > THRESHOLD:\n        findings.append({\n            "rule_id": "PFX-001",\n            "severity": "medium",\n            "evidence": {\n                "count": len(window),\n                "signatures": [item["signature"] for item in window],\n            },\n        })`} />
          <p className="docs-note">Severity describes a configured detection rule. Arqon does not currently return an aggregate wallet risk score or claim that an address is safe.</p>
        </section>

        <section className="docs-section" id="privacy" data-doc-section>
          <SectionNumber number="05" label="PRIVACY & LIMITATIONS" />
          <h2>Public data only</h2>
          <p>Arqon accepts public addresses and makes read-only RPC requests. It does not request private keys, connect to a wallet, sign transactions, or write to Solana.</p>
          <div className="docs-limit-grid"><article><b>Collected</b><p>Public address, recent signatures, transaction metadata, and SOL balance when the RPC provider returns it.</p></article><article><b>Not analyzed yet</b><p>Token transfer parsing and deeper program interaction analysis are not included in the current activity response.</p></article><article><b>No aggregate score</b><p>Current responses expose individual findings; they do not calculate a wallet-wide risk score.</p></article></div>
          <p className="docs-note">The Arqon API and configured RPC provider process requests to serve analysis. Operators may process request metadata according to their deployment and retention policies.</p>
        </section>

        <section className="docs-section" id="api-reference" data-doc-section>
          <SectionNumber number="06" label="API REFERENCE" />
          <h2>HTTP API</h2>
          <p>All application endpoints use the configurable <code>{API_PREFIX}</code> prefix. Interactive OpenAPI docs are served by the backend at <code>{API_PREFIX}/docs</code>.</p>
          <div className="docs-endpoint"><span className="method method-get">GET</span><code>/health</code><p>Service liveness, version, and environment.</p></div>
          <div className="docs-endpoint"><span className="method method-get">GET</span><code>/system/info</code><p>Application and deployment configuration information.</p></div>
          <div className="docs-endpoint"><span className="method method-post">POST</span><code>/wallet/validate</code><p>Validate a public Solana address. Body: <code>{'{ "address": "..." }'}</code>.</p></div>
          <div className="docs-endpoint"><span className="method method-get">GET</span><code>/wallet/activity</code><p>Recent transactions and deterministic findings. Required query: <code>address</code>; optional <code>limit</code> (1–100, default 20).</p></div>
          <h3>Wallet activity response</h3>
          <CodeBlock title="Response shape" language="json" code={`{\n  "address": "<canonical-public-key>",\n  "sol_balance_lamports": 1248000000,\n  "items": [{\n    "signature": "<transaction-signature>",\n    "slot": 301234567,\n    "block_time": 1739900000,\n    "status": "success",\n    "fee_lamports": 5000,\n    "sol_change_lamports": -25000000\n  }],\n  "findings": [{\n    "rule_id": "PFX-001",\n    "category": "high-frequency-activity",\n    "severity": "medium",\n    "description": "...",\n    "evidence": { "count": 6, "signatures": ["..."] }\n  }]\n}`} />
          <p className="docs-note">The values above illustrate the response schema only. They do not describe an actual wallet or investigation. Lamports are the smallest SOL unit (1 SOL = 1,000,000,000 lamports).</p>
        </section>

        <section className="docs-section" id="responses-errors" data-doc-section>
          <SectionNumber number="07" label="RESPONSES & ERRORS" />
          <h2>Status codes</h2>
          <div className="docs-error-list"><div><code>200</code><span>Request completed. A valid activity response can still contain empty items if the address has no recent data.</span></div><div><code>400</code><span>Invalid Solana address.</span></div><div><code>422</code><span>Request validation failed (for example, missing address or an out-of-range limit).</span></div><div><code>502</code><span>Configured RPC provider could not return activity.</span></div><div><code>500</code><span>Unexpected server error; internal details are not exposed.</span></div></div>
          <CodeBlock title="Handle a failed API response" language="typescript" code={`const response = await fetch(url);\nif (!response.ok) {\n  const body = await response.json().catch(() => null);\n  const message = typeof body?.detail === "string"\n    ? body.detail\n    : "Request failed (" + response.status + ")";\n  throw new Error(message);\n}`} />
        </section>

        <section className="docs-section" id="configuration" data-doc-section>
          <SectionNumber number="08" label="CONFIGURATION" />
          <h2>Environment settings</h2>
          <p>Backend settings are loaded from environment variables or a local <code>.env</code> file. Defaults are suitable for local development.</p>
          <div className="docs-config-table"><div><code>API_V1_PREFIX</code><span>API route prefix</span><b>/api/v1</b></div><div><code>SOLANA_RPC_URL</code><span>Solana JSON-RPC endpoint</span><b>mainnet-beta public RPC</b></div><div><code>SOLANA_REQUEST_TIMEOUT</code><span>Provider timeout in seconds</span><b>10</b></div><div><code>BACKEND_HOST</code><span>Uvicorn bind address</span><b>127.0.0.1</b></div><div><code>BACKEND_PORT</code><span>Uvicorn port</span><b>8000</b></div><div><code>DATABASE_URL</code><span>SQLAlchemy database URL</span><b>sqlite:///./arqon_dev.db</b></div><div><code>VITE_API_BASE_URL</code><span>Frontend API base URL</span><b>/api/v1</b></div><div><code>VITE_PROXY_TARGET</code><span>Vite development proxy target</span><b>http://127.0.0.1:8000</b></div></div>
        </section>

        <section className="docs-section" id="development" data-doc-section>
          <SectionNumber number="09" label="DEVELOPMENT" />
          <h2>Run the project locally</h2>
          <p>Use Python 3.11+ and Node.js 20+. See the repository development guide for Docker and test commands.</p>
          <CodeBlock title="Install and run" language="shell" code={`# Terminal 1 — backend\ncd backend\npython3 -m venv .venv\nsource .venv/bin/activate\npip install -r requirements.txt\npython -m uvicorn app.main:app --reload --port 8000\n\n# Terminal 2 — frontend\ncd frontend\nnpm install\nnpm run dev`} />
          <div className="docs-inline-links"><a href={`${GITHUB_URL}/blob/main/docs/architecture.md`} target="_blank" rel="noreferrer">Architecture file <ExternalLink size={13}/></a><a href={`${GITHUB_URL}/blob/main/docs/development.md`} target="_blank" rel="noreferrer">Development guide <ExternalLink size={13}/></a><a href={`${GITHUB_URL}/blob/main/docs/detection-rules.md`} target="_blank" rel="noreferrer">Detection rules <ExternalLink size={13}/></a></div>
        </section>

        <section className="docs-section docs-open-source" id="open-source" data-doc-section>
          <SectionNumber number="10" label="CONTRIBUTE" />
          <h2>Security belongs in the open.</h2>
          <p>Inspect the code, review the rule registry, and propose changes with clear evidence and tests. Arqon is published under the MIT License.</p>
          <a className="docs-github-button" href={GITHUB_URL} target="_blank" rel="noreferrer"><GithubLogo size={17}/> Explore the repository <ExternalLink size={13}/></a>
        </section>
        <footer className="docs-footer"><Link to="/" className="docs-back-link"><ArrowLeft size={14}/> Back to Arqon</Link><span>Analyze. Investigate. Verify.</span><a href="#docs-top" aria-label="Back to top"><ArrowUp size={14}/> Top</a></footer>
      </main>
    </div>
  </div>;
}

function SectionNumber({ number, label }: { number: string; label: string }) {
  return <div className="docs-section-kicker"><span>{number}</span><i/>{label}</div>;
}
