import { useEffect, useState, type FormEvent } from "react";
import type { FriendDto } from "@mafioo/shared";
import { api, ApiError } from "../api/client";
import { DataTable } from "../design-system/DataTable";
import { Card } from "../design-system/Card";
import { Link } from "react-router-dom";

export function FriendsPage() {
  const [friends, setFriends] = useState<FriendDto[] | null>(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const data = await api.get<{ friends: FriendDto[] }>("/friend");
    setFriends(data.friends);
  }

  useEffect(() => {
    load();
  }, []);

  async function invite(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await api.post("/friend/invite", { username });
      setMessage(`Friend request sent to ${username}.`);
      setUsername("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to invite");
    }
  }

  async function accept(id: string) {
    await api.post(`/friend/${id}/accept`);
    await load();
  }

  return (
    <div>
      <h2>Friends</h2>
      <Card title="Add a friend">
        <form onSubmit={invite} style={{ display: "flex", gap: 8 }}>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <button className="button" type="submit">
            Invite
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}
      </Card>

      <div style={{ height: 16 }} />

      {friends === null ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          rows={friends}
          rowKey={(f) => f.id}
          emptyMessage="No friends yet."
          columns={[
            {
              key: "name",
              header: "Player",
              render: (f) => <Link to={`/profile/${f.friend.username}`}>{f.friend.username}</Link>,
            },
            { key: "level", header: "Level", render: (f) => f.friend.level },
            { key: "status", header: "Status", render: (f) => f.status },
            {
              key: "actions",
              header: "",
              render: (f) =>
                f.status === "pending" ? (
                  <button className="button button--secondary" onClick={() => accept(f.id)}>
                    Accept
                  </button>
                ) : null,
            },
          ]}
        />
      )}
    </div>
  );
}
