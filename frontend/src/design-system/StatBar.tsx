interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export function StatBar({ label, value, max, color = "var(--color-accent)" }: StatBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="statbar" title={`${label}: ${Math.floor(value)}/${max}`}>
      <span>{label}</span>
      <div className="statbar__track">
        <div className="statbar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span>
        {Math.floor(value)}/{max}
      </span>
    </div>
  );
}
