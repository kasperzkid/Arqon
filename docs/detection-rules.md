# Detection rules

> Placeholder — the detection rule framework and the first rules are
> under development (see [architecture](architecture.md)).

## Rule shape (planned)

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

Rules are data, not code: the registry (`app/detection/registry.py`) and the
engine (`app/detection/engine.py`) evaluate rule definitions against
normalized transaction/wallet data (`app/scanner/normalizers/`).

## No AI

The platform is rule-based. Models or heuristics that cannot cite a rule
and its evidence are not acceptable findings.
