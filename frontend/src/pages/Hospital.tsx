import { useState } from "react";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../design-system/Card";

interface Action {
  key: "detox" | "heal" | "surgery";
  title: string;
  description: string;
  cashStamina: string;
}

const ACTIONS: Action[] = [
  { key: "detox", title: "Detox", description: "Clears toxication.", cashStamina: "10 stamina" },
  { key: "heal", title: "Refill life", description: "Restores life to maximum.", cashStamina: "2 stamina" },
  {
    key: "surgery",
    title: "Plastic surgery",
    description: "Clears heat and criminal record. Once per day.",
    cashStamina: "$31,800 + 60 stamina",
  },
];

export function HospitalPage() {
  const { player, refresh } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ key: string; message: string; ok: boolean } | null>(null);
  if (!player) return null;

  async function run(action: Action, useCredits: boolean) {
    const busyKey = `${action.key}-${useCredits}`;
    setBusy(busyKey);
    try {
      await api.post(`/hospital/${action.key}`, { useCredits });
      setFeedback({ key: action.key, message: `${action.title} done.`, ok: true });
      await refresh();
    } catch (err) {
      setFeedback({ key: action.key, message: err instanceof ApiError ? err.message : "Failed", ok: false });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h2>Hospital</h2>
      <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
        {ACTIONS.map((action) => (
          <Card key={action.key} title={action.title}>
            <p style={{ color: "var(--color-text-muted)" }}>{action.description}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="button"
                disabled={busy === `${action.key}-false`}
                onClick={() => run(action, false)}
              >
                {action.cashStamina}
              </button>
              <button
                className="button button--gold"
                disabled={busy === `${action.key}-true`}
                onClick={() => run(action, true)}
              >
                1 credit
              </button>
            </div>
            {feedback?.key === action.key && (
              <p className={feedback.ok ? "success-text" : "error-text"}>{feedback.message}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
