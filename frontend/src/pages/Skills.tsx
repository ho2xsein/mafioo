import { useEffect, useState } from "react";
import type { SkillDto } from "@mafioo/shared";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../design-system/Card";

export function SkillsPage() {
  const { player, refresh } = useAuth();
  const [skills, setSkills] = useState<SkillDto[] | null>(null);
  const [freeSkillPoints, setFreeSkillPoints] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const data = await api.get<{ skills: SkillDto[]; freeSkillPoints: number }>("/skills");
    setSkills(data.skills);
    setFreeSkillPoints(data.freeSkillPoints);
  }

  useEffect(() => {
    load();
  }, []);

  async function addPoint(skill: SkillDto) {
    setError(null);
    setBusy(skill.key);
    try {
      await api.post(`/skills/add/${skill.key}`);
      await load();
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    setError(null);
    try {
      await api.post("/skills/reset");
      await load();
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed");
    }
  }

  if (!skills || !player) return <p>Loading skills...</p>;

  return (
    <div>
      <h2>Skills</h2>
      <p>
        Free points: <strong style={{ color: "var(--color-accent)" }}>{freeSkillPoints}</strong>{" "}
        <button className="button button--secondary" onClick={reset} style={{ marginLeft: 12 }}>
          Reset all (10 credits)
        </button>
      </p>
      {error && <p className="error-text">{error}</p>}
      <div style={{ display: "grid", gap: 10 }}>
        {skills.map((skill) => {
          const locked = player.level < skill.unlockLevel;
          return (
            <Card key={skill.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <strong>
                    {skill.name} <span style={{ color: "var(--color-text-muted)" }}>Lv.{skill.level}</span>
                  </strong>
                  <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                    {skill.description}
                  </p>
                  {locked && (
                    <p className="error-text" style={{ margin: "4px 0 0" }}>
                      Requires player level {skill.unlockLevel}
                    </p>
                  )}
                </div>
                <button
                  className="button"
                  disabled={locked || freeSkillPoints < 1 || busy === skill.key}
                  onClick={() => addPoint(skill)}
                >
                  {busy === skill.key ? "..." : "Add"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
