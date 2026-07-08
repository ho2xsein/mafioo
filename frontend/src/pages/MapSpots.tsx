import { useState } from "react";
import type { CrimeActionResult, MapSpotDef } from "@mafioo/shared";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../design-system/Card";

export function MapSpots({ spots }: { spots: MapSpotDef[] }) {
  const { refresh } = useAuth();
  const [busySpot, setBusySpot] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ spotId: string; message: string; success: boolean } | null>(null);

  async function doAction(spot: MapSpotDef) {
    setBusySpot(spot.id);
    try {
      const result = await api.post<CrimeActionResult>(`/map/crime/${spot.id}`);
      setLastResult({ spotId: spot.id, message: result.message, success: result.success });
      await refresh();
    } catch (err) {
      setLastResult({
        spotId: spot.id,
        message: err instanceof ApiError ? err.message : "Action failed",
        success: false,
      });
    } finally {
      setBusySpot(null);
    }
  }

  return (
    <Card title="Crime spots">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {spots.map((spot) => (
          <div key={spot.id} className="card" style={{ padding: 12 }}>
            <strong>{spot.label}</strong>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Stamina: {spot.staminaCost} &middot; Risk: {spot.riskPercent}% &middot; Reward: ${spot.rewardMin}-$
              {spot.rewardMax}
            </p>
            <button
              className="button"
              disabled={busySpot === spot.id}
              onClick={() => doAction(spot)}
              style={{ width: "100%" }}
            >
              {busySpot === spot.id ? "..." : "Do it"}
            </button>
            {lastResult?.spotId === spot.id && (
              <p className={lastResult.success ? "success-text" : "error-text"}>{lastResult.message}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
