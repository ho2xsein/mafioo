import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { StatBar } from "./StatBar";

const PRIMARY_NAV = [
  { to: "/city", label: "City" },
  { to: "/street", label: "My Street" },
  { to: "/school", label: "School" },
  { to: "/fitness", label: "Fitness" },
  { to: "/bars", label: "Bars" },
  { to: "/top10/respect", label: "Standings" },
  { to: "/contrabandist", label: "Contrabandist" },
  { to: "/market", label: "Black Market" },
  { to: "/jail", label: "Jail" },
  { to: "/hospital", label: "Hospital" },
  { to: "/bank", label: "Bank" },
];

const SECONDARY_NAV = [
  { to: "/inventory", label: "Inventory" },
  { to: "/skills", label: "Skills" },
  { to: "/rackets", label: "Rackets" },
  { to: "/msg/inbox", label: "Inbox" },
  { to: "/friends", label: "Friends" },
  { to: "/quests", label: "Quest" },
  { to: "/tasks", label: "Tasks" },
  { to: "/crime_log", label: "History" },
  { to: "/polls", label: "Polls" },
];

export function AppShell() {
  const { player, loading, logout } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!player) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          padding: "12px 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "center",
          background: "var(--color-bg-elevated)",
        }}
      >
        <strong style={{ color: "var(--color-accent-strong)" }}>
          {player.username} <span style={{ color: "var(--color-text-muted)" }}>Lv.{player.level}</span>
        </strong>
        <StatBar label="Life" value={player.life} max={player.maxLife} color="var(--color-danger)" />
        <StatBar label="Stamina" value={player.stamina} max={player.maxStamina} color="var(--color-success)" />
        <span>Cash: ${player.cash.toLocaleString()}</span>
        <span>Bank: ${player.bankBalance.toLocaleString()}</span>
        <span>Credits: {player.credits}</span>
        <NavLink to="/profile/me" style={{ marginLeft: "auto" }}>
          Profile
        </NavLink>
        <button className="button button--secondary" onClick={() => logout()}>
          Logout
        </button>
      </header>

      <nav style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 20px", background: "var(--color-bg)" }}>
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `tabs__tab ${isActive ? "tabs__tab--active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: "0 20px 8px",
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {SECONDARY_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `tabs__tab ${isActive ? "tabs__tab--active" : ""}`}
            style={{ fontSize: 12 }}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
