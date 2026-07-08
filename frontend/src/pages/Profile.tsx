import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PlayerPublic } from "@mafioo/shared";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../design-system/Card";
import { Avatar } from "../design-system/Avatar";

export function ProfilePage() {
  const { username = "me" } = useParams();
  const { player: me } = useAuth();
  const [player, setPlayer] = useState<PlayerPublic | null>(null);

  useEffect(() => {
    if (username === "me") {
      setPlayer(me);
      return;
    }
    api.get<{ player: PlayerPublic }>(`/profile/${username}`).then((d) => setPlayer(d.player));
  }, [username, me]);

  if (!player) return <p>Loading profile...</p>;

  const isMe = username === "me" || player.username === me?.username;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>{player.username}</h2>
      <Card>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Avatar avatarId={player.avatarId} size={80} />
          <div>
            <p>Level: {player.level}</p>
            <p>Respect: {player.respect}</p>
            <p>
              Street: ({player.streetX}, {player.streetY})
            </p>
            <p>Gang: {player.gangId ?? "None"}</p>
            <p>Faction: {player.factionId ?? "None"}</p>
            {isMe && <Link to="/profile/avatar">Change avatar</Link>}
          </div>
        </div>
      </Card>
    </div>
  );
}
