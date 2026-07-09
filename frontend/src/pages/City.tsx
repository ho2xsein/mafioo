import { useEffect, useState } from "react";
import type { MapTileResponse } from "@mafioo/shared";
import { api } from "../api/client";
import { MapSpots } from "./MapSpots";

export function CityPage() {
  const [tile, setTile] = useState<MapTileResponse | null>(null);

  useEffect(() => {
    api.get<MapTileResponse>("/map/city").then(setTile);
  }, []);

  if (!tile) return <p>Loading city...</p>;

  return (
    <div>
      <h2>City</h2>
      <p style={{ color: "var(--color-text-muted)" }}>
        Shared crime spots — banks, hospital, police, market and jail are reachable from the nav above.
      </p>
      <MapSpots spotGroups={tile.spotGroups} />
    </div>
  );
}
