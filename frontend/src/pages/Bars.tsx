import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { BarItemDto, BarSummary, BarUseResult } from "@mafioo/shared";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../design-system/Card";
import { DataTable } from "../design-system/DataTable";

export function BarsListPage() {
  const [bars, setBars] = useState<BarSummary[] | null>(null);

  useEffect(() => {
    api.get<{ bars: BarSummary[] }>("/bar").then((d) => setBars(d.bars));
  }, []);

  if (!bars) return <p>Loading bars...</p>;

  return (
    <div>
      <h2>Bars</h2>
      <DataTable
        rows={bars}
        rowKey={(b) => b.id}
        emptyMessage="No bars yet."
        columns={[
          { key: "name", header: "Name", render: (b) => <Link to={`/bars/${b.id}`}>{b.name}</Link> },
          { key: "type", header: "Type", render: (b) => b.type },
          { key: "rating", header: "Rating", render: (b) => b.rating },
          { key: "owner", header: "Owner", render: (b) => b.ownerUsername ?? "Unowned" },
        ]}
      />
    </div>
  );
}

export function BarDetailPage() {
  const { id } = useParams();
  const { player, refresh } = useAuth();
  const [bar, setBar] = useState<BarSummary | null>(null);
  const [items, setItems] = useState<BarItemDto[] | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; message: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const data = await api.get<{ bar: BarSummary; items: BarItemDto[] }>(`/bar/${id}`);
    setBar(data.bar);
    setItems(data.items);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function use(item: BarItemDto) {
    setBusy(item.id);
    try {
      const result = await api.post<BarUseResult>(`/bar/${id}/use/${item.id}`);
      setFeedback({ id: item.id, message: result.message, ok: true });
      await load();
      await refresh();
    } catch (err) {
      setFeedback({ id: item.id, message: err instanceof ApiError ? err.message : "Failed", ok: false });
    } finally {
      setBusy(null);
    }
  }

  if (!bar || !items) return <p>Loading bar...</p>;

  return (
    <div>
      <h2>{bar.name}</h2>
      <p style={{ color: "var(--color-text-muted)" }}>
        {bar.type} &middot; rating {bar.rating} &middot; owner: {bar.ownerUsername ?? "unowned"}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {items.map((item) => {
          const canAfford = player ? player.cash >= item.buyCash : false;
          const outOfStock = item.quantityAvailable <= 0;
          return (
            <Card key={item.id}>
              {item.icon && (
                <img
                  src={item.icon}
                  alt={item.name}
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 4, marginBottom: 8 }}
                />
              )}
              <strong>{item.name}</strong>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {item.buyCash > 0 ? `$${item.buyCash.toLocaleString()}` : "Free"} &middot; {item.quantityAvailable}/
                {item.maxQuantity} left
              </p>
              <button
                className="button"
                style={{ width: "100%" }}
                disabled={busy === item.id || outOfStock || !canAfford}
                onClick={() => use(item)}
              >
                {busy === item.id ? "..." : outOfStock ? "Sold out" : "Use"}
              </button>
              {feedback?.id === item.id && (
                <p className={feedback.ok ? "success-text" : "error-text"}>{feedback.message}</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
