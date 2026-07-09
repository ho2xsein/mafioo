interface StatBarProps {
  label: string;
  value: number;
  max: number;
}

/** Mirrors the original game's gauge component: green above 50%, gold 20-50%, red below. */
function gaugeColor(pct: number): string {
  if (pct > 50) return "#33cc33";
  if (pct > 20) return "var(--color-warning)";
  return "var(--color-danger)";
}

export function StatBar({ label, value, max }: StatBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="statbar" title={`${label}: ${Math.floor(value)}/${max}`}>
      <span>{label}</span>
      <div className="statbar__track">
        <div className="statbar__fill" style={{ width: `${pct}%`, background: gaugeColor(pct) }} />
      </div>
      <span>
        {Math.floor(value)}/{max}
      </span>
    </div>
  );
}
