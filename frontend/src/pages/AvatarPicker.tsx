import { AVATAR_IDS, avatarUrl } from "@mafioo/shared";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../design-system/Card";

export function AvatarPickerPage() {
  const { player, refresh } = useAuth();
  if (!player) return null;

  async function choose(avatarId: number) {
    await api.post("/profile/me/avatar", { avatarId });
    await refresh();
  }

  return (
    <div>
      <h2>Choose your avatar</h2>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: 10 }}>
          {AVATAR_IDS.map((id) => (
            <button
              key={id}
              onClick={() => choose(id)}
              style={{
                padding: 0,
                border: id === player.avatarId ? "2px solid var(--color-accent)" : "2px solid transparent",
                borderRadius: 6,
                background: "transparent",
                cursor: "pointer",
              }}
              title={`Avatar ${id}`}
            >
              <img src={avatarUrl(id)} width="100%" style={{ display: "block", borderRadius: 4 }} alt="" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
