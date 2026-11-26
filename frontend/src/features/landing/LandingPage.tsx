import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, Atom, BookOpen, Check,
  CheckCircle2, ChevronDown, CircleHelp, ExternalLink,
  FileSearch, GitBranch, LayoutDashboard, ListChecks, LockKeyhole, Menu, ScanEye, Search, ShieldAlert,
  WalletCards, X,
} from "lucide-react";
import { GithubLogo } from "../../components/common/GithubLogo";
import { Meteors } from "../../components/ui/meteors";
import { fetchWalletActivity, fetchWalletProbe, validateWalletAddress, type WalletActivityItem } from "../../services/api";
import { CapabilitiesSection } from "./CapabilitiesSection";
import { WorkflowBentoCards } from "./WorkflowBentoCards";

const GITHUB_URL = "https://github.com/kasperzkid/Arqon";
const DOCS_URL = "/docs";

const platformMetrics = [
  { value: "—", label: "Wallets analyzed", note: "Not yet aggregated", available: false },
  { value: "—", label: "Transactions inspected", note: "Not yet aggregated", available: false },
  { value: "1", label: "Detection rules", note: "Registered activity rule", available: true },
  { value: "1", label: "Threat indicators", note: "High-frequency activity", available: true },
];

const faqItems = [
  ["What is Arqon?", "Arqon is an open-source, rule-based Solana security analysis platform. It examines public wallet activity and transactions to identify suspicious patterns and present evidence-backed findings."],
  ["Does Arqon require wallet connection?", "No. Enter a public Solana address to inspect it. Arqon does not ask you to connect or sign with a wallet."],
  ["Does Arqon access private keys?", "No. Arqon only accepts public addresses and reads public blockchain data. It never requests or stores private keys, signs transactions, or changes on-chain state."],
  ["How does risk scoring work?", "The current backend returns rule-based findings with severity and supporting evidence. It does not yet provide an aggregate risk score, so Arqon does not present one as a live result."],
  ["Does Arqon use artificial intelligence?", "No. Detection is deterministic and rule-based. Arqon does not use AI or machine learning to produce findings."],
  ["Which blockchain does Arqon support?", "The current implementation analyzes Solana mainnet-beta data through a configurable Solana RPC provider."],
  ["Is Arqon open-source?", "Yes. Arqon is available under the MIT License. You can inspect the code, run it yourself, and contribute through GitHub."],
];

const ecosystemLogos = [
  { name: "Solana", className: "logo-solana", mark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5H21l-3.25 3.25H1.25L4.5 5.5Zm3.25 4.875H24L20.75 13.625H4.5l3.25-3.25ZM4.5 15.25H21l-3.25 3.25H1.25l3.25-3.25Z" fill="currentColor"/></svg> },
  { name: "React", className: "logo-react", mark: <Atom aria-hidden="true" /> },
  { name: "TypeScript", className: "logo-typescript", mark: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#3178C6" d="M2 2h20v20H2z"/><path fill="#fff" d="M12.27 16.58c.4.65.92 1.13 1.85 1.13.78 0 1.28-.39 1.28-.93 0-.65-.51-.88-1.37-1.25l-.47-.2c-1.36-.58-2.26-1.31-2.26-2.85 0-1.42 1.08-2.5 2.77-2.5 1.2 0 2.07.42 2.69 1.53l-1.47.94c-.32-.58-.67-.81-1.22-.81s-.91.35-.91.81c0 .56.35.8 1.15 1.15l.47.2c1.6.69 2.51 1.4 2.51 2.99 0 1.71-1.34 2.65-3.14 2.65-1.76 0-2.9-.84-3.46-1.95zm-6.58.16c.3.53.57.98 1.22.98.62 0 .99-.24.99-1.17v-6.43h1.9v6.46c0 1.97-1.15 2.87-2.83 2.87-1.52 0-2.4-.78-2.85-1.72z"/></svg> },
  { name: "FastAPI", className: "logo-fastapi", mark: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#009688"/><path fill="#fff" d="m13.52 3.8-7.1 10.04h4.54l-.5 6.36 7.12-10.04h-4.56z"/></svg> },
  { name: "Python", className: "logo-python", mark: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#3776AB" d="M11.9 1C8.2 1 6.1 2.4 6.1 4.9v3.4h6.1v1H4.8c-2.6 0-3.8 1.8-3.8 4.8 0 3.1 1.3 4.9 3.8 4.9h2.3v-3.1c0-2.6 1.7-4.5 4.3-4.5h4.9c2.2 0 3.6-1.5 3.6-3.8V4.9C19.9 2.2 17.7 1 14 1zM8.7 3.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/><path fill="#FFD43B" d="M12.1 23c3.7 0 5.8-1.4 5.8-3.9v-3.4h-6.1v-1h7.4c2.6 0 3.8-1.8 3.8-4.8 0-3.1-1.3-4.9-3.8-4.9h-2.3v3.1c0 2.6-1.7 4.5-4.3 4.5H7.7c-2.2 0-3.6 1.5-3.6 3.8v2.7c0 2.7 2.2 3.9 5.9 3.9zM15.3 20.8a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"/></svg> },
];

function EcosystemMarquee() {
  return <div className="ecosystem-marquee" aria-label="Open-source technologies used by Arqon">
    {[0, 1].map((copy) => <div className="ecosystem-track" key={copy} aria-hidden={copy === 1}>
      {ecosystemLogos.map(({ name, className, mark }) => <span className={`ecosystem-logo ${className}`} key={name}>
        {mark}<b>{name}</b>
      </span>)}
    </div>)}
  </div>;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const items = [
    ["Product", "#analyzer"], ["Features", "#features"],
    ["Detection", "#detection"], ["Documentation", DOCS_URL], ["GitHub", GITHUB_URL],
  ];
  return (
    <header className="site-header">
      <div className="nav-inner">
        <a className="brand" href="#top" aria-label="Arqon home"><span>arqon</span></a>
        <nav id="main-navigation" className={`nav-links ${open ? "nav-links-open" : ""}`} aria-label="Main navigation">
          {items.map(([label, href]) => href.startsWith("#")
            ? <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>
            : href.startsWith("/")
              ? <Link key={label} to={href} onClick={() => setOpen(false)}>{label}</Link>
              : <a key={label} href={href} target="_blank" rel="noreferrer">{label}<ExternalLink size={12} /></a>)}
          <div className="mobile-nav-actions"><a className="github-icon-button" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Arqon on GitHub"><GithubLogo size={16} /></a><a className="button button-primary" href="/dashboard" onClick={() => setOpen(false)}>Launch app <ArrowRight size={15} /></a></div>
        </nav>
        <div className="nav-actions"><a className="github-icon-button" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Arqon on GitHub"><GithubLogo size={18} /></a><a className="button button-primary nav-cta" href="/dashboard">Launch app <ArrowRight size={15} /></a></div>
        <button className="mobile-menu-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-controls="main-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

function networkName(network: string): string {
  return network === "devnet" ? "Devnet" : network === "testnet" ? "Testnet" : "Mainnet Beta";
}

function WalletAnalyzer() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ address: string; network: string; activeNetworks: string[]; balanceLamports: number | null; items: WalletActivityItem[]; findings: Array<{rule_id:string; severity:string; description:string}> } | null>(null);
  const [error, setError] = useState("");

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!address.trim()) { setError("Enter a public Solana wallet address to continue."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const validation = await validateWalletAddress(address.trim());
      if (!validation.valid || !validation.address) throw new Error("This address is not a valid Solana public address.");
      const probe = await fetchWalletProbe(validation.address);
      if (probe.networks.length > 0 && probe.networks.every((network) => network.error)) {
        throw new Error("Could not reach Solana mainnet, devnet, or testnet. Please try again.");
      }
      const activeNetworks = probe.networks.filter((network) => network.active).map((network) => network.network);
      const network = probe.primary_network || "mainnet";
      const activity = await fetchWalletActivity(validation.address, 5, network);
      setResult({ address: validation.address, network: activity.network || network, activeNetworks, balanceLamports: activity.sol_balance_lamports, items: activity.items, findings: activity.findings ?? [] });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The analysis request could not be completed. Check the API connection and try again.");
    } finally { setLoading(false); }
  }

  return <div className="analyzer-wrap">
    <form className="analyzer-form" onSubmit={analyze} noValidate>
      {error && <div id="wallet-error" className="error-label" role="alert"><ShieldAlert size={13} />{error}</div>}
      <div className="input-icon"><WalletCards size={18} /></div>
      <label className="sr-only" htmlFor="wallet-address">Solana wallet address</label>
      <input id="wallet-address" value={address} onChange={(event) => { setAddress(event.target.value); setError(""); }} placeholder="Enter a Solana wallet address..." autoComplete="off" spellCheck={false} aria-invalid={Boolean(error)} aria-describedby={error ? "wallet-error" : undefined} />
      <button className="button button-primary analyze-button" type="submit" disabled={loading} aria-live="polite">{loading ? <><span className="spinner" /> Analyzing</> : <>Analyze wallet <ArrowRight size={16} /></>}</button>
    </form>
    <div className="analyzer-foot"><span><LockKeyhole size={13} /> Read-only analysis. No wallet connection required.</span></div>
    {result && <div className="scan-result" aria-live="polite">
      <div className="result-heading">
        <span className="result-status"><CheckCircle2 size={16} /> Scan complete</span>
        <span className="result-network-badge"><i /> {networkName(result.network)}</span>
        <button type="button" onClick={() => setResult(null)} aria-label="Dismiss results"><X size={16} /></button>
      </div>
      <div className="result-wallet">
        <span className="result-eyebrow">WALLET</span>
        <p className="result-address">{result.address}</p>
      </div>
      {result.activeNetworks.length > 1 && <p className="result-network-extra">Also active on {result.activeNetworks.filter((network) => network !== result.network).map(networkName).join(", ")}</p>}
      <div className="result-stat-grid">
        <div className="result-stat"><strong>{result.balanceLamports == null ? "—" : (result.balanceLamports / 1e9).toFixed(4)}</strong><span>SOL BALANCE</span></div>
        <div className="result-stat"><strong>{result.items.length}</strong><span>TRANSACTIONS</span></div>
        <div className="result-stat"><strong>{result.findings.length}</strong><span>RULE FINDINGS</span></div>
      </div>
      {result.items.length > 0 && <div className="result-transactions">
        <div className="result-transactions-heading"><span>RECENT TRANSACTIONS</span><span>{result.items.length} shown</span></div>
        {result.items.map((tx) => {
          const explorerUrl = `https://explorer.solana.com/tx/${tx.signature}${result.network === "mainnet" ? "" : `?cluster=${encodeURIComponent(result.network)}`}`;
          const solChange = tx.sol_change_lamports == null ? null : tx.sol_change_lamports / 1e9;
          return <div className="result-transaction" key={tx.signature}>
            <div className="result-transaction-main">
              <span className={`result-transaction-dot ${tx.status === "confirmed" ? "is-confirmed" : tx.status === "failed" ? "is-failed" : ""}`} />
              <div className="result-transaction-id"><a href={explorerUrl} target="_blank" rel="noreferrer">{tx.signature.slice(0, 12)}…{tx.signature.slice(-8)} <ExternalLink size={10}/></a><small>{tx.block_time ? new Date(tx.block_time * 1000).toLocaleString() : "Time unavailable"}</small></div>
            </div>
            <div className="result-transaction-meta"><span className={`result-transaction-status ${tx.status === "failed" ? "is-failed" : ""}`}>{tx.status}</span><b className={solChange == null ? "" : solChange >= 0 ? "is-positive" : "is-negative"}>{solChange == null ? "—" : `${solChange > 0 ? "+" : ""}${solChange.toFixed(4)} SOL`}</b></div>
          </div>;
        })}
      </div>}
      {result.items.length === 0 ? (
        <div className="result-empty"><span className="result-empty-title">No recent transactions found</span><p>No activity was returned from {networkName(result.network)}.</p></div>
      ) : result.findings.length > 0 ? (
        <ul className="result-findings">{result.findings.map((finding, index) => <li key={`${finding.rule_id}-${index}`}><span className="rule-tag">{finding.rule_id}</span><span>{finding.description}</span><b>{finding.severity}</b></li>)}</ul>
      ) : (
        <div className="result-empty"><span className="result-empty-title"><CheckCircle2 size={15} /> No rule matches in this sample</span><p>{result.items.length} recent transactions checked · This is not a full wallet safety assessment.</p></div>
      )}
      <Link to="/wallet-analysis" className="result-link"><span style={{ color: "#111" }}>Open wallet analysis</span><ArrowRight size={14} color="#111" /></Link>
    </div>}
  </div>;
}

function SectionHeading({ eyebrow, title, text, centered = false }: { eyebrow?: string; title: string; text?: string; centered?: boolean }) {
  return <div className={`section-heading ${centered ? "section-heading-center" : ""}`}>{eyebrow && <span className="eyebrow"><i />{eyebrow}</span>}<h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

function SampleReport() {
  return <div className="report-window scanner-dashboard" aria-label="Illustrative sample wallet scanner dashboard">
    <header className="scanner-topbar">
      <div className="scanner-brand"><span className="scanner-brand-mark">A</span><b>arqon</b><i/> <span>WALLET SCANNER</span></div>
      <span className="scanner-network"><i/> SOLANA MAINNET-BETA</span>
      <span className="scanner-sample-label">ILLUSTRATIVE SAMPLE · NOT LIVE</span>
    </header>
    <div className="scanner-content">
      <div className="scanner-page-heading"><div><span>INVESTIGATION</span><h3>Wallet overview</h3></div><span className="scanner-scan-time">SAMPLE REPORT <b>·</b> 18 FEB 2025</span></div>
      <div className="scanner-address-bar"><WalletCards size={19}/><div><small>PUBLIC SOLANA ADDRESS</small><strong>7xKX…mP9a <em>ILLUSTRATIVE</em></strong></div><span className="scanner-address-valid"><Check size={14}/> Valid format</span><span className="scanner-address-action"><Search size={15}/> Scan preview</span></div>
      <div className="scanner-kpis">
        <article><span>SOL BALANCE</span><strong>12.48 <small>SOL</small></strong><em>Sample value</em></article>
        <article><span>TRANSACTIONS</span><strong>1,284</strong><em>Sample value</em></article>
        <article><span>FINDINGS</span><strong className="scanner-accent-value">01</strong><em>Sample value</em></article>
        <article><span>RISK SCORE</span><strong className="scanner-unscored">Not scored</strong><em>No aggregate score</em></article>
      </div>
      <div className="scanner-main-grid">
        <section className="scanner-panel scanner-activity-panel">
          <div className="scanner-panel-head"><div><span>ON-CHAIN ACTIVITY</span><h4>Transaction activity</h4></div><span className="scanner-period">SAMPLE WINDOW <ChevronDown size={13}/></span></div>
          <div className="scanner-chart"><div className="scanner-chart-grid"/><svg viewBox="0 0 640 150" role="img" aria-label="Illustrative wallet activity over time"><defs><linearGradient id="scannerChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e4e4e7" stopOpacity=".18"/><stop offset="1" stopColor="#e4e4e7" stopOpacity="0"/></linearGradient></defs><path className="scanner-chart-area" d="M0 117 C45 111 53 78 94 88 S143 106 185 64 S232 89 280 57 S341 78 387 40 S434 69 476 45 S541 60 575 28 S618 44 640 19 L640 150 L0 150Z"/><path className="scanner-chart-line" d="M0 117 C45 111 53 78 94 88 S143 106 185 64 S232 89 280 57 S341 78 387 40 S434 69 476 45 S541 60 575 28 S618 44 640 19"/></svg></div>
          <div className="scanner-chart-labels"><span>MAR 12</span><span>JUN 04</span><span>SEP 21</span><span>FEB 18</span></div>
          <div className="scanner-activity-legend"><span><i/> Incoming activity</span><span><i/> Outgoing activity</span><small>ILLUSTRATIVE CHART</small></div>
          <div className="scanner-observed"><span>FIRST OBSERVED <b>2024-03-12 09:14 UTC</b></span><span>LAST OBSERVED <b>2025-02-18 16:42 UTC</b></span></div>
        </section>
        <section className="scanner-panel scanner-finding-panel">
          <div className="scanner-panel-head"><div><span>DETECTION FINDING</span><h4>Activity to review</h4></div><span className="scanner-severity">MEDIUM</span></div>
          <div className="scanner-rule-id"><ShieldAlert size={17}/><b>PFX-001</b><span>HIGH-FREQUENCY ACTIVITY</span></div>
          <p className="scanner-rule-description">More than five timestamped transactions within a ten-minute window.</p>
          <div className="scanner-evidence-list"><div><span>OBSERVED COUNT</span><b>6 transactions</b></div><div><span>TIME WINDOW</span><b>600 seconds</b></div><div><span>SUPPORTING TX</span><b>5kP9…8vQt</b></div><div><span>CONFIDENCE</span><b>Not scored</b></div></div>
          <div className="scanner-caveat"><CircleHelp size={14}/><span>A review signal, not a claim of malicious activity.</span></div>
        </section>
      </div>
      <section className="scanner-transactions">
        <div className="scanner-panel-head"><div><span>RECENT TRANSACTIONS</span><h4>Activity evidence</h4></div><span className="scanner-table-sample">SAMPLE DATA</span></div>
        <div className="scanner-table-scroll"><table><thead><tr><th>TRANSACTION</th><th>TIME</th><th>SOL CHANGE</th><th>STATUS</th><th>RULE</th></tr></thead><tbody><tr><td><code>5kP9…8vQt</code></td><td>2025-02-18 16:42 UTC</td><td className="scanner-negative">−0.025 SOL</td><td><span className="scanner-confirmed"><i/> Confirmed</span></td><td><b>PFX-001</b></td></tr></tbody></table></div>
      </section>
      <p className="scanner-disclaimer"><CircleHelp size={13}/> Illustrative sample data only. This is not a live wallet scan.</p>
      <div className="scanner-dock" role="group" aria-label="Sample scanner dashboard navigation"><span className="scanner-dock-active"><LayoutDashboard size={15}/> Overview</span><span><Activity size={15}/> Activity</span><span><ShieldAlert size={15}/> Findings <b>01</b></span><span><FileSearch size={15}/> Evidence</span></div>
    </div>
  </div>;
}

function TerminalPreview() {
  return <figure className="terminal-preview" aria-label="Source preview from Arqon's PFX-001 detection rule">
    <div className="terminal-topbar">
      <div className="terminal-dots" aria-hidden="true"><i/><i/><i/></div>
      <span>arqon <i/> ~/repository</span>
      <span className="terminal-topbar-status">SOURCE VIEW</span>
    </div>
    <div className="terminal-screen">
      <div className="terminal-command"><b>$</b><code>rg -n "PFX-001" backend/app/detection/registry.py</code></div>
      <div className="terminal-source" aria-label="Rule definition excerpt">
        <span><em>19</em><code>rule_id=<strong>"PFX-001"</strong>,</code></span>
        <span><em>20</em><code>category=<strong>"high-frequency-activity"</strong>,</code></span>
        <span><em>21</em><code>severity=<strong>"medium"</strong>,</code></span>
        <span><em>22</em><code>description=(</code></span>
        <span><em>23</em><code>    <strong>"More than five transactions occurred within a ten-minute window."</strong></code></span>
        <span><em>26</em><code>transaction_threshold=<strong>5</strong>,</code></span>
        <span><em>27</em><code>window_seconds=<strong>600</strong>,</code></span>
      </div>
      <div className="terminal-command terminal-next-command"><b>$</b><span className="terminal-cursor" aria-hidden="true"/></div>
    </div>
    <figcaption className="terminal-statusbar"><span><i/> backend/app/detection/registry.py</span><span>PFX-001 <i/> MEDIUM</span></figcaption>
  </figure>;
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return <div className="faq-list">{faqItems.map(([question, answer], index) => <div className={`faq-item ${open === index ? "faq-open" : ""}`} key={question}>
    <h3><button aria-expanded={open === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(open === index ? null : index)}>{question}<ChevronDown size={17} /></button></h3>
    <div id={`faq-answer-${index}`} className="faq-answer" aria-hidden={open !== index}><div className="faq-answer-inner"><p>{answer}</p></div></div>
  </div>)}</div>;
}

function FooterLink({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  return <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>{children}</a>;
}

export default function LandingPage() {
  return <div className="landing-page" id="top">
    <div className="meteors-bg" aria-hidden="true"><Meteors number={48} angle={220} /></div>
    <Navbar />
    <main>
      <section className="hero-section">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-facets" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></div>
        <div className="hero-content">
          <div className="hero-title-block">
            <h1>Every transaction<br/><span>Tells a story.</span></h1>
          </div>
          <div className="hero-action-block">
            <p className="hero-description">Arqon analyzes Solana wallets, transactions, and program interactions to identify suspicious activity and deliver transparent, evidence-backed security insights.</p>
            <div className="hero-actions">
              <a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer"><GithubLogo size={15}/> Explore on GitHub</a>
              <Link className="button button-quiet hero-read-docs" to={DOCS_URL}><BookOpen size={15}/> Read the docs</Link>
            </div>
          </div>
        </div>
        <div className="hero-trust-strip" aria-label="Arqon technology and project principles">
          <p className="ecosystem-title">Built <span>With</span></p>
          <EcosystemMarquee />
        </div>
      </section>

      <section className="analyzer-section" id="analyzer"><div className="analyzer-section-inner"><div className="analyzer-section-copy"><h2>Begin with a public address.</h2><p>Inspect recent transactions and evidence-backed activity findings.</p></div><WalletAnalyzer /></div></section>

      <section className="stats-section" aria-label="Platform data availability">
        <div className="stats-inner">
          <div className="stats-intro">
            <div><h2>Only what we can verify.</h2></div>
            <p>Wallet and transaction totals are not aggregated yet. Rule counts reflect the configured detection registry.</p>
          </div>
          <div className="stats-grid">
            {platformMetrics.map(({ value, label, note, available }) => <div className={`stat-item ${available ? "stat-available" : "stat-pending"}`} key={label}>
              <div className="stat-value-row"><strong>{value}</strong><span className="stat-state"><i/>{available ? "AVAILABLE" : "PENDING"}</span></div>
              <span className="stat-label">{label}</span>
              <small>{note}</small>
            </div>)}
          </div>
        </div>
      </section>

      <CapabilitiesSection />

      <section className="content-section workflow-section" id="how-it-works"><SectionHeading title="From address to investigation." text="A clear path from public key to evidence you can inspect." />
        <WorkflowBentoCards />
      </section>

      <section className="content-section report-section"><div className="report-intro"><SectionHeading title="Every finding has evidence." text="Explore transparent security reports that explain suspicious activity and show exactly why an indicator was triggered."/><div className="report-points"><p><span><Check size={14}/></span> Trace findings to specific rule IDs</p><p><span><Check size={14}/></span> Review supporting transaction evidence</p><p><span><Check size={14}/></span> Understand severity and context</p></div></div><SampleReport /></section>

      <section className="xd-section" id="detection">
        <div className="xd-intro">
          <SectionHeading eyebrow="EXPLAINABLE BY DESIGN" title="No black boxes." text="Every finding traces back to a named rule, real transaction evidence, and an explicit severity level — not an opaque score."/>
          <Link className="detection-cta" to="/security-findings"><span className="detection-cta-inner">Explore detection findings <ArrowRight size={14}/></span></Link>
        </div>
        <div className="xd-cards">
          <article className="xd-card">
            <div className="xd-card-header">
              <span className="xd-tag">RULE ENGINE</span>
              <span className="xd-num">01</span>
            </div>
            <div className="xd-icon-wrap"><ScanEye size={20}/></div>
            <h3 className="xd-title">Deterministic rules</h3>
            <p className="xd-desc">Every detection follows a named, versioned rule. The identifier is always visible — no AI inference, no hidden logic.</p>
          </article>
          <article className="xd-card">
            <div className="xd-card-header">
              <span className="xd-tag">EVIDENCE</span>
              <span className="xd-num">02</span>
            </div>
            <div className="xd-icon-wrap"><FileSearch size={20}/></div>
            <h3 className="xd-title">Traceable evidence</h3>
            <p className="xd-desc">Findings attach directly to transaction signatures, observed time windows, and the raw data that triggered them.</p>
          </article>
          <article className="xd-card">
            <div className="xd-card-header">
              <span className="xd-tag">ASSESSMENT</span>
              <span className="xd-num">03</span>
            </div>
            <div className="xd-icon-wrap"><ListChecks size={20}/></div>
            <h3 className="xd-title">Explicit severity</h3>
            <p className="xd-desc">Severity is set on the rule, not inferred. No aggregate risk score is surfaced until the backend can support it reliably.</p>
          </article>
        </div>
      </section>

      <section className="open-source-section" id="open-source"><div className="opensource-glow"/><div className="opensource-copy"><h2>Security belongs<br/>in the open.</h2><p>Arqon is an open-source project. Inspect the code, review detection rules, contribute intelligence, and help improve blockchain security.</p><div className="opensource-actions"><a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">Explore on GitHub <ArrowRight size={15}/></a><Link className="button button-quiet" to={DOCS_URL}><BookOpen size={15}/> Read the docs</Link></div></div><TerminalPreview /></section>

      <section className="content-section faq-section" id="faq"><div className="faq-intro"><SectionHeading eyebrow="FAQ" title="Questions, answered." text="Learn more about how Arqon analyzes public blockchain data."/><Link className="text-link" to={DOCS_URL}>Browse documentation <ArrowRight size={15}/></Link></div><FAQ /></section>

      <section className="privacy-note" id="privacy"><div><span className="eyebrow"><i/> PRIVACY</span><h2>Public address in. Public data out.</h2></div><p>The analyzer sends the public address you enter to the Arqon API and its configured Solana RPC provider to validate the address and retrieve public on-chain activity. It never asks for private keys or wallet signatures. Hosting, API, and RPC operators may process request metadata under their own deployment and retention policies.</p></section>

      <section className="closing-cta"><h2>Make on-chain activity<br/><span>easier to understand.</span></h2><p>Investigate with clarity. Verify every finding.</p><a className="button button-primary" href="/dashboard">Launch app <ArrowRight size={15}/></a></section>
    </main>

    <footer className="site-footer"><div className="footer-main"><div className="footer-brand-column"><a className="brand" href="#top"><span>arqon</span></a><p>Open-source Solana security analysis built on transparent rules and verifiable evidence.</p><span className="footer-license"><GitBranch size={13}/> Open source · MIT License</span></div><div className="footer-links"><div><b>PRODUCT</b><FooterLink href="#features">Features</FooterLink><FooterLink href="#how-it-works">How it works</FooterLink><FooterLink href="#detection">Detection</FooterLink><Link to="/wallet-analysis">Wallet analysis</Link></div><div><b>RESOURCES</b><Link to={DOCS_URL}>Documentation</Link><Link to="/docs#api-reference">API reference</Link><FooterLink href={GITHUB_URL} external>GitHub <ExternalLink size={11}/></FooterLink><FooterLink href="#privacy">Privacy</FooterLink><FooterLink href={`${GITHUB_URL}/blob/main/LICENSE`} external>MIT license</FooterLink></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Arqon</span><span>Analyze. Investigate. Verify.</span><span>Read-only · Solana</span></div></footer>
  </div>;
}
