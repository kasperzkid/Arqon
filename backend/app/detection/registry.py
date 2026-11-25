"""Definitions for deterministic wallet activity rules."""

from dataclasses import dataclass


@dataclass(frozen=True)
class ActivityRule:
    """Configuration for a high-frequency activity rule."""

    rule_id: str
    category: str
    severity: str
    description: str
    transaction_threshold: int
    window_seconds: int


HIGH_FREQUENCY_ACTIVITY = ActivityRule(
    rule_id="PFX-001",
    category="high-frequency-activity",
    severity="medium",
    description=(
        "More than five transactions occurred within a ten-minute window. "
        "This pattern may warrant review and is not proof of malicious activity."
    ),
    transaction_threshold=5,
    window_seconds=600,
)

ACTIVITY_RULES = (HIGH_FREQUENCY_ACTIVITY,)
