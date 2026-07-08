import { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import type { MapTileResponse } from "@mafioo/shared";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { MapSpots } from "./MapSpots";
import { Card } from "../design-system/Card";

export function StreetRedirect() {
  const { player } = useAuth();
  if (!player) return null;
  return <Navigate to={`/street/${player.streetX}/${player.streetY}`} replace />;
}

export function StreetPage() {
  const { x, y } = useParams();
  const { player } = useAuth();
  const [tile, setTile] = useState<MapTileResponse | null>(null);

  useEffect(() => {
    if (x === undefined || y === undefined) return;
    api.get<MapTileResponse>(`/map/street/${x}/${y}`).then(setTile);
  }, [x, y]);

  if (!tile) return <p>Loading street...</p>;

  const isOwnStreet = tile.owner?.username === player?.username;

  return (
    <div>
      <h2>
        Street ({tile.x}, {tile.y})
      </h2>
      {tile.owner ? (
        <p>
          Owned by <Link to={`/profile/${tile.owner.username}`}>{tile.owner.username}</Link> (Lv.
          {tile.owner.level}) {isOwnStreet && "— this is your street"}
        </p>
      ) : (
        <p style={{ color: "var(--color-text-muted)" }}>This street is vacant.</p>
      )}

      <Card title="Neighboring streets">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tile.neighbors.map((n) => (
            <Link key={`${n.x},${n.y}`} to={`/street/${n.x}/${n.y}`} className="button button--secondary">
              ({n.x}, {n.y})
            </Link>
          ))}
        </div>
      </Card>

      <div style={{ height: 16 }} />

      {tile.owner ? (
        <MapSpots spots={tile.spots} />
      ) : (
        <p style={{ color: "var(--color-text-muted)" }}>No crime spots on a vacant lot.</p>
      )}
    </div>
  );
}
