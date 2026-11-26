import { Binary, FileSearch, KeyRound, LockKeyhole, Network, ScanSearch, WalletCards, ArrowDownToLine, Clock3 } from "lucide-react";
import { BentoCard, BentoGrid } from "../../components/ui/bento-grid";

function AddressArtwork() {
  return <div className="bento-artwork bento-address-art">
    <div className="bento-art-label">WALLET ANALYZER <span>PUBLIC KEY</span></div>
    <div className="bento-address-field"><WalletCards size={18}/><span className="bento-typewriter-text">Enter a Solana address</span><span className="bento-field-caret"/></div>
    <div className="bento-readonly"><LockKeyhole size={13}/> Read-only <i/> No signing request</div>
    <div className="bento-art-foot"><span>SOLANA MAINNET-BETA</span><span>01 / 03</span></div>
  </div>;
}

function ProcessArtwork() {
  const stages = [
    { number: "01", label: "RPC DATA", detail: "Fetch public transactions", Icon: Network },
    { number: "02", label: "SIGNATURES", detail: "Keep traceable sources", Icon: FileSearch },
    { number: "03", label: "PARSER", detail: "Normalize instructions", Icon: Binary },
    { number: "04", label: "RULES", detail: "Check configured patterns", Icon: ScanSearch },
    { number: "05", label: "EVIDENCE", detail: "Return inspectable records", Icon: FileSearch },
  ];

  return <div className="bento-artwork bento-process-art">
    <div className="bento-art-label">PUBLIC ACTIVITY <span>INSPECTION</span></div>
    <div className="bento-process-flow-viewport">
      <div className="bento-process-flow">
        {[0, 1].map((cycle) => <div className="bento-process-cycle" key={cycle} aria-hidden={cycle === 1}>
          {stages.map(({ number, label, detail, Icon }, index) => <div className="bento-process-stage" key={`${cycle}-${number}`}>
            <div className="bento-process-node"><Icon size={17}/></div>
            <span className="bento-process-index">{number}</span>
            <span className="bento-process-stage-copy"><b>{label}</b><small>{detail}</small></span>
            {index < stages.length - 1 && <i className="bento-process-connector" aria-hidden="true"><span/></i>}
          </div>)}
        </div>)}
      </div>
    </div>
    <p className="bento-process-caption">Fetch <span>→</span> parse <span>→</span> evaluate <span>→</span> inspect evidence</p>
    <div className="bento-art-foot"><span>DETERMINISTIC EVALUATION</span><span>02 / 03</span></div>
  </div>;
}

function FindingsArtwork() {
  return <div className="bento-artwork bento-findings-art">
    <div className="bento-findings-heading"><span className="bento-art-label">INSPECTABLE EVIDENCE</span><span className="bento-illustrative">EXAMPLE</span></div>
    <div className="bento-finding-row"><span className="bento-field-key">FINDING</span><b className="bento-rule-id">PFX-001</b><span className="bento-finding-note">Rule identifier</span></div>
    <div className="bento-finding-row"><span className="bento-field-key">OBSERVED</span><b className="bento-severity"><Clock3 size={12}/> Activity window</b><span className="bento-finding-note">On-chain timestamp</span></div>
    <div className="bento-finding-row"><span className="bento-field-key">SOURCE</span><b className="bento-evidence"><ArrowDownToLine size={12}/> Signature</b><span className="bento-finding-note">Verify on Solscan</span></div>
    <div className="bento-art-foot"><span><FileSearch size={12}/> FOLLOW THE SOURCE</span><span>03 / 03</span></div>
  </div>;
}

const cards = [
  {
    number: "01", stage: "PUBLIC KEY", name: "Start with an address",
    description: "Enter a Solana public key to begin. Analysis is read-only: no wallet connection, private key, or signature required.",
    Icon: KeyRound, background: <AddressArtwork/>, href: "#analyzer", cta: "Analyze a wallet", tone: "lime" as const, className: "bento-input-card",
  },
  {
    number: "02", stage: "ACTIVITY", name: "Inspect on-chain activity",
    description: "Review fetched transactions and parsed instructions as configured deterministic rules check for notable activity.",
    Icon: Network, background: <ProcessArtwork/>, href: "/docs#how-it-works", cta: "Explore the pipeline", tone: "sage" as const, className: "bento-process-card",
  },
  {
    number: "03", stage: "EVIDENCE", name: "Follow each finding to evidence",
    description: "See the rule identifier, severity, and supporting transaction signature so you can inspect the source for yourself.",
    Icon: FileSearch, background: <FindingsArtwork/>, href: "/security-findings", cta: "View detection rules", tone: "stone" as const, className: "bento-output-card",
  },
];

export function WorkflowBentoCards() {
  return <BentoGrid aria-label="Three stages of a Solana wallet investigation" className="workflow-bento-grid">
    {cards.map((card) => <BentoCard key={card.number} {...card} />)}
  </BentoGrid>;
}
