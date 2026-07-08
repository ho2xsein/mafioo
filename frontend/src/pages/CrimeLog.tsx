import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CrimeLogEntry } from "@mafioo/shared";
import { api } from "../api/client";
import { DataTable } from "../design-system/DataTable";
import { useAuth } from "../auth/AuthContext";

export function CrimeLogPage() {
  const { player } = useAuth();
  const [entries, setEntries] = useState<CrimeLogEntry[] | null>(null);

  useEffect(() => {
    api.get<{ entries: CrimeLogEntry[] }>("/crime_log").then((d) => setEntries(d.entries));
  }, []);

  if (!entries) return <p>Loading...</p>;

  return (
    <div>
      <h2>History</h2>
      <DataTable
        rows={entries}
        rowKey={(e) => e.id}
        emptyMessage="No fights yet."
        columns={[
          { key: "type", header: "Type", render: (e) => e.type },
          { key: "date", header: "Date", render: (e) => new Date(e.createdAt).toLocaleString() },
          {
            key: "attacker",
            header: "Attacker",
            render: (e) => <Link to={`/profile/${e.attacker.username}`}>{e.attacker.username}</Link>,
          },
          {
            key: "victim",
            header: "Victim",
            render: (e) => <Link to={`/profile/${e.victim.username}`}>{e.victim.username}</Link>,
          },
          {
            key: "result",
            header: "Result",
            render: (e) => {
              const won = (e.result === "victory") === (e.attacker.username === player?.username);
              return <span className={won ? "success-text" : "error-text"}>{e.result}</span>;
            },
          },
        ]}
      />
    </div>
  );
}
