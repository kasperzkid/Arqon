type CapabilityIconName = "wallet" | "transaction" | "shield" | "evidence";

function CapabilityIcon({ name }: { name: CapabilityIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 21,
    height: 21,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.55,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "wallet":
      return <svg {...common}><path d="M4.5 6.5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2h10" /><path d="M4.5 9h15v4.5h-4a2.25 2.25 0 0 1 0-4.5" /><circle cx="15.5" cy="11.25" r=".55" fill="currentColor" stroke="none" /></svg>;
    case "transaction":
      return <svg {...common}><path d="M4 7h14m0 0-3-3m3 3-3 3" /><path d="M20 17H6m0 0 3-3m-3 3 3 3" /><path d="M4 7v2m16 6v2" opacity=".55" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3.5 19 6v5.2c0 4.4-2.8 7.7-7 9.3-4.2-1.6-7-4.9-7-9.3V6l7-2.5Z" /><path d="m9 11.8 2 2 4-4.2" /></svg>;
    case "evidence":
      return <svg {...common}><path d="M7 3.5h7l4 4v12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5v-14A2 2 0 0 1 8 3.5Z" /><path d="M14 3.8v4h4M9 12h5m-5 3h3" /><path d="m14.5 17 1.4 1.4 2.8-3" /></svg>;
  }
}

const capabilities = [
  {
    icon: "wallet" as const,
    number: "01",
    name: "Wallet intelligence",
    description: "Validate public Solana addresses and inspect recent account activity without connecting a wallet.",
    status: "AVAILABLE",
  },
  {
    icon: "transaction" as const,
    number: "02",
    name: "Transaction analysis",
    description: "Review normalized signatures, transaction status, fees, and SOL balance changes.",
    status: "AVAILABLE",
  },
  {
    icon: "shield" as const,
    number: "03",
    name: "Threat detection",
    description: "Evaluate activity with deterministic rules. The current registry includes the PFX-001 velocity check.",
    status: "RULE-BASED",
  },
  {
    icon: "evidence" as const,
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
        {capabilities.map(({ icon, number, name, description, status }) => (
          <article className="capability-card" key={number}>
            <span className="capability-number">{number}</span>
            <span className="capability-icon"><CapabilityIcon name={icon} /></span>
            <div className="capability-copy"><h3>{name}</h3><p>{description}</p></div>
            <span className={`capability-status ${status === "AVAILABLE" ? "status-live" : ""}`}><i/>{status}</span>
          </article>
        ))}
      </div>
      <p className="capabilities-note">Token-account and deeper program analysis are in development. No capability claims are represented as completed scans.</p>
    </section>
  );
}
