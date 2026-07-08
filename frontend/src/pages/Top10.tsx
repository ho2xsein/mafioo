import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Top10Row } from "@mafioo/shared";
import { api } from "../api/client";
import { DataTable } from "../design-system/DataTable";
import { Tabs } from "../design-system/Tabs";
import { useNavigate } from "react-router-dom";

const METRICS = [
  { key: "respect", label: "Respect" },
  { key: "level", label: "Level" },
  { key: "strength", label: "Strength" },
  { key: "intellect", label: "Intellect" },
  { key: "sexapeal", label: "Sexapeal" },
  { key: "criminal_record", label: "Criminal record" },
];

export function Top10Page() {
  const { metric = "respect" } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Top10Row[] | null>(null);

  useEffect(() => {
    setRows(null);
    api.get<{ rows: Top10Row[] }>(`/top10/${metric}`).then((d) => setRows(d.rows));
  }, [metric]);

  return (
    <div>
      <h2>Standings</h2>
      <Tabs tabs={METRICS} active={metric} onChange={(key) => navigate(`/top10/${key}`)} />
      {rows === null ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          rows={rows}
          rowKey={(r) => r.player.id}
          columns={[
            { key: "rank", header: "#", render: (r) => r.rank },
            {
              key: "player",
              header: "Gangster",
              render: (r) => <Link to={`/profile/${r.player.username}`}>{r.player.username}</Link>,
            },
            { key: "level", header: "Level", render: (r) => r.player.level },
            { key: "value", header: "Value", render: (r) => r.value },
          ]}
        />
      )}
    </div>
  );
}
