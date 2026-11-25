import { ArrowLeftRight, FileSearch, ScanEye, WalletCards } from "lucide-react";

const capabilities = [
  {
    icon: WalletCards,
    number: "01",
    name: "Wallet intelligence",
    description: "Validate public Solana addresses and inspect recent account activity without connecting a wallet.",
    status: "AVAILABLE",
  },
  {
    icon: ArrowLeftRight,
    number: "02",
    name: "Transaction analysis",
    description: "Review normalized signatures, transaction status, fees, and SOL balance changes.",
    status: "AVAILABLE",
  },
  {
    icon: ScanEye,
    number: "03",
    name: "Threat detection",
    description: "Evaluate activity with deterministic rules. The current registry includes the PFX-001 velocity check.",
    status: "RULE-BASED",
  },
  {
    icon: FileSearch,
    number: "04",
    name: "Evidence reports",
    description: "Review rule identifiers, severity, time windows, and supporting transaction signatures.",
    status: "EVIDENCE-LED",
  },
];

export function CapabilitiesSection() {
  return (
    <section className="capabilities-bento-section" id="features" aria-labelledby="capabilities-heading">
      <div className="capabilities-heading">
        <h2 id="capabilities-heading">Intelligence for every layer of on-chain activity.</h2>
        <p>Understand what happens on-chain through transparent, evidence-based analysis.</p>
      </div>
      <div className="capabilities-grid">
        {capabilities.map(({ icon: Icon, number, name, description, status }) => (
          <article className="capability-card" key={number}>
            <span className="capability-number">{number}</span>
            <span className="capability-icon"><Icon size={19} strokeWidth={1.55} /></span>
            <div className="capability-copy"><h3>{name}</h3><p>{description}</p></div>
            <span className={`capability-status ${status === "AVAILABLE" ? "status-live" : ""}`}><i/>{status}</span>
          </article>
        ))}
      </div>
      <p className="capabilities-note">Token-account and deeper program analysis are in development. No capability claims are represented as completed scans.</p>
    </section>
  );
}
