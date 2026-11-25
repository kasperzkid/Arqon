# Detection rules

The first deterministic rule is implemented in `app/detection/` and runs on
normalized wallet activity returned by the wallet activity endpoint.

## Rule shape

Each finding must have an identifiable rule and supporting evidence:

```yaml
rule:
  id: "PFX-001"                 # unique, e.g. prefix + number
  category: "high-frequency-transfer"
  severity: "medium"            # info | low | medium | high | critical
  description: "Transfers exceeding N within M minutes"
  evidence:
    - type: "transaction_count"
      threshold: { "gt": 5 }
    - type: "recipient"
      ...
```

The registry (`app/detection/registry.py`) stores typed rule definitions and
the engine (`app/detection/engine.py`) evaluates them against normalized
transaction data (`app/scanner/normalizers/`). Every finding includes its
rule ID and evidence.

## Implemented rules

| ID | Category | Severity | Condition | Evidence |
|---|---|---|---|---|
| `PFX-001` | `high-frequency-activity` | medium | More than five timestamped transactions within 600 seconds | Count, time bounds, signatures |

This is a review signal, not a claim that the wallet is malicious. Missing
transaction data and transactions without timestamps are excluded.

## No AI

The platform is rule-based. Models or heuristics that cannot cite a rule
and its evidence are not acceptable findings.
