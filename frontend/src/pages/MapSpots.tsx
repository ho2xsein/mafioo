import { useState } from "react";
import type { CrimeActionResult, MapSpotDef, MapSpotGroup } from "@mafioo/shared";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../design-system/Card";

export function MapSpots({ spotGroups }: { spotGroups: MapSpotGroup[] }) {
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
      {spotGroups.map((group) => (
        <Card key={group.spotLabel} title={group.spotLabel}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {group.actions.map((spot) => (
              <div key={spot.id}>
                <button
                  className="button"
                  disabled={busySpot === spot.id}
                  onClick={() => doAction(spot)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 8 }}
                  title={`Stamina ${spot.staminaCost} · Risk ${spot.riskPercent}%`}
                >
                  <span>{busySpot === spot.id ? "..." : spot.actionLabel}</span>
                  <span style={{ fontWeight: "normal", opacity: 0.8 }}>
                    {spot.reward >= 0 ? `+$${spot.reward}` : `-$${Math.abs(spot.reward)}`}
                  </span>
                </button>
                {lastResult?.spotId === spot.id && (
                  <p className={lastResult.success ? "success-text" : "error-text"} style={{ margin: "2px 0 0" }}>
                    {lastResult.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
