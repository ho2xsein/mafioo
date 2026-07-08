import { Card } from "../design-system/Card";

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <Card>
        <p style={{ color: "var(--color-text-muted)" }}>
          This feature is scaffolded (route + nav entry) but the game logic hasn't been built yet. It's next up
          in the build plan.
        </p>
      </Card>
    </div>
  );
}
