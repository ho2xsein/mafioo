import { useState, type FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../design-system/Card";

function AmountForm({
  label,
  onSubmit,
}: {
  label: string;
  onSubmit: (amount: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!Number.isInteger(value) || value <= 0) {
      setError("Enter a positive whole number");
      return;
    }
    setBusy(true);
    try {
      await onSubmit(value);
      setAmount("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <div className="form-row" style={{ marginBottom: 0, flex: 1 }}>
        <label>{label}</label>
        <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <button className="button" disabled={busy} type="submit">
        {busy ? "..." : "Go"}
      </button>
      {error && <span className="error-text">{error}</span>}
    </form>
  );
}

export function BankPage() {
  const { player, refresh } = useAuth();
  if (!player) return null;

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 480 }}>
      <h2>Bank</h2>
      <Card title="Balances">
        <p>Cash on hand: ${player.cash.toLocaleString()}</p>
        <p>Bank balance: ${player.bankBalance.toLocaleString()} (max $3,750,000)</p>
        <p>Credits: {player.credits}</p>
        <p>Connections: {player.connections}</p>
      </Card>

      <Card title="Deposit">
        <AmountForm
          label="Amount to deposit"
          onSubmit={async (amount) => {
            await api.post("/bank/deposit", { amount });
            await refresh();
          }}
        />
      </Card>

      <Card title="Withdraw">
        <AmountForm
          label="Amount to withdraw"
          onSubmit={async (amount) => {
            await api.post("/bank/withdraw", { amount });
            await refresh();
          }}
        />
      </Card>

      <Card title="Exchange credits -> cash (1 credit = $190,000, max 500/tx)">
        <AmountForm
          label="Credits to exchange"
          onSubmit={async (credits) => {
            await api.post("/bank/buy-cash", { credits });
            await refresh();
          }}
        />
      </Card>

      <Card title="Buy connections ($100,000 = 1 connection, max 100/tx)">
        <AmountForm
          label="Connections to buy"
          onSubmit={async (connections) => {
            await api.post("/bank/buy-connections", { connections });
            await refresh();
          }}
        />
      </Card>
    </div>
  );
}
