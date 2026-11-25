"""Tests for deterministic wallet activity detection."""

from app.detection.engine import detect_activity_findings


def _transactions(count: int, interval: int = 60) -> list[dict[str, object]]:
    return [
        {
            "signature": f"signature-{index}",
            "block_time": 1_700_000_000 + index * interval,
            "status": "success",
        }
        for index in range(count)
    ]


def test_high_frequency_rule_requires_more_than_five_transactions():
    assert detect_activity_findings(_transactions(5)) == []

    findings = detect_activity_findings(_transactions(6))
    assert len(findings) == 1
    assert findings[0]["rule_id"] == "PFX-001"
    assert findings[0]["evidence"]["observed_count"] == 6
    assert len(findings[0]["evidence"]["signatures"]) == 6


def test_high_frequency_rule_excludes_out_of_window_and_unavailable_data():
    transactions = _transactions(6, interval=121)
    transactions.append(
        {"signature": "unavailable", "block_time": 1_700_000_100, "status": "unavailable"}
    )
    assert detect_activity_findings(transactions) == []
