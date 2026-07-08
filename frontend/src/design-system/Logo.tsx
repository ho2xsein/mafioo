export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 1,
        color: "var(--color-accent-strong)",
        textShadow: "0 1px 0 rgba(0,0,0,0.6)",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span aria-hidden style={{ fontSize: size * 1.1 }}>
        🎩
      </span>
      Mafioo
    </span>
  );
}
