"""Tests for transaction normalization."""

from solders.keypair import Keypair

from app.scanner.normalizers.transaction import normalize_transaction


def test_normalize_transaction_extracts_wallet_sol_delta_and_failure():
    wallet = str(Keypair.from_seed(b"\x01" * 32).pubkey())
    transaction = {
        "slot": 42,
        "blockTime": 1_700_000_000,
        "transaction": {"message": {"accountKeys": [wallet]}},
        "meta": {"err": {"InstructionError": [0, "Custom"]}, "fee": 5000,
                 "preBalances": [10_000], "postBalances": [4_000]},
    }

    normalized = normalize_transaction("signature", wallet, transaction)

    assert normalized["status"] == "failed"
    assert normalized["slot"] == 42
    assert normalized["fee_lamports"] == 5000
    assert normalized["sol_change_lamports"] == -6000


def test_normalize_missing_transaction_returns_unavailable():
    wallet = str(Keypair.from_seed(b"\x02" * 32).pubkey())
    normalized = normalize_transaction("signature", wallet, None)
    assert normalized["status"] == "unavailable"
    assert normalized["sol_change_lamports"] is None
