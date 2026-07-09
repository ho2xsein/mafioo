import { useEffect, useState } from "react";
import type { ExtraDto } from "@mafioo/shared";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../design-system/Card";

export function ExtrasPage() {
  const { player, refresh } = useAuth();
  const [extras, setExtras] = useState<ExtraDto[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; message: string; ok: boolean } | null>(null);

  async function load() {
    const data = await api.get<{ extras: ExtraDto[] }>("/extras");
    setExtras(data.extras);
  }

  useEffect(() => {
    load();
  }, []);

  async function buy(extra: ExtraDto) {
    setBusy(extra.id);
    try {
      await api.post(`/extras/buy/${extra.id}`);
      setFeedback({ id: extra.id, message: `${extra.name} purchased.`, ok: true });
      await load();
      await refresh();
    } catch (err) {
      setFeedback({ id: extra.id, message: err instanceof ApiError ? err.message : "Failed", ok: false });
    } finally {
      setBusy(null);
    }
  }

  if (!extras || !player) return <p>Loading extras...</p>;

  return (
    <div>
      <h2>Extras</h2>
      <p style={{ color: "var(--color-text-muted)" }}>Your credits: {player.credits}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {extras.map((extra) => (
          <Card key={extra.id} title={extra.name}>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{extra.description}</p>
            {extra.durationHours > 0 && (
              <p style={{ fontSize: 12 }}>Duration: {extra.durationHours}h</p>
            )}
            {extra.activeUntil && (
              <p className="success-text">Active until {new Date(extra.activeUntil).toLocaleString()}</p>
            )}
            <button
              className="button button--gold"
              style={{ width: "100%" }}
              disabled={busy === extra.id || player.credits < extra.priceCredits}
              onClick={() => buy(extra)}
            >
              {busy === extra.id ? "..." : `${extra.priceCredits} credits`}
            </button>
            {feedback?.id === extra.id && (
              <p className={feedback.ok ? "success-text" : "error-text"}>{feedback.message}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
