"""Evaluate deterministic detection rules against normalized wallet activity."""

from collections.abc import Iterable, Mapping
from typing import Any

from app.detection.registry import ACTIVITY_RULES


def detect_activity_findings(
    activity: Iterable[Mapping[str, Any]],
) -> list[dict[str, Any]]:
    """Return findings supported by transaction timestamps and signatures."""
    timestamped = sorted(
        (
            (int(item["block_time"]), str(item["signature"]))
            for item in activity
            if item.get("block_time") is not None
            and item.get("status") != "unavailable"
            and item.get("signature")
        ),
        key=lambda transaction: transaction[0],
    )
    findings = []

    for rule in ACTIVITY_RULES:
        left = 0
        largest_window: tuple[int, int] | None = None
        for right, (timestamp, _) in enumerate(timestamped):
            while timestamp - timestamped[left][0] > rule.window_seconds:
                left += 1
            if right - left + 1 > rule.transaction_threshold:
                candidate = (left, right)
                if largest_window is None or (
                    candidate[1] - candidate[0] > largest_window[1] - largest_window[0]
                ):
                    largest_window = candidate

        if largest_window is None:
            continue

        start, end = largest_window
        window_transactions = timestamped[start : end + 1]
        findings.append(
            {
                "rule_id": rule.rule_id,
                "category": rule.category,
                "severity": rule.severity,
                "description": rule.description,
                "evidence": {
                    "type": "transaction_count",
                    "threshold": {"gt": rule.transaction_threshold},
                    "window_seconds": rule.window_seconds,
                    "observed_count": len(window_transactions),
                    "start_time": window_transactions[0][0],
                    "end_time": window_transactions[-1][0],
                    "signatures": [signature for _, signature in window_transactions],
                },
            }
        )

    return findings
