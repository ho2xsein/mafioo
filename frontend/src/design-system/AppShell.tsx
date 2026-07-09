import { NavLink, Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { StatBar } from "./StatBar";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";

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
  { to: "/extras", label: "Extras" },
  { to: "/rackets", label: "Rackets" },
  { to: "/msg/inbox", label: "Inbox" },
  { to: "/friends", label: "Friends" },
  { to: "/quests", label: "Quest" },
  { to: "/tasks", label: "Tasks" },
  { to: "/crime_log", label: "History" },
  { to: "/polls", label: "Polls" },
];

const navTabStyle = ({ isActive }: { isActive: boolean }) =>
  `main-nav__item ${isActive ? "main-nav__item--active" : ""}`;

export function AppShell() {
  const { player, loading, logout } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!player) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/city" style={{ display: "flex", alignItems: "center" }}>
            <Logo />
          </Link>
          <Link to="/profile/me" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar avatarId={player.avatarId} size={40} />
            <strong style={{ color: "var(--color-accent)" }}>
              {player.username} <span style={{ color: "var(--color-text-muted)" }}>Lv.{player.level}</span>
            </strong>
          </Link>
          <StatBar label="Life" value={player.life} max={player.maxLife} />
          <StatBar label="Stamina" value={player.stamina} max={player.maxStamina} />
          <span className="app-header__stat" title="Attack = (Strength + Intellect + Sexapeal) / 3">
            Atk: {player.attack.toLocaleString()}
          </span>
          <span className="app-header__stat">Def: {player.defencePercent}%</span>
          <span className="app-header__stat">Cash: ${player.cash.toLocaleString()}</span>
          <span className="app-header__stat">Bank: ${player.bankBalance.toLocaleString()}</span>
          <span className="app-header__stat app-header__stat--gold">Credits: {player.credits}</span>
          <button className="button button--secondary" style={{ marginLeft: "auto" }} onClick={() => logout()}>
            Logout
          </button>
        </div>
      </header>

      <nav className="main-nav">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={navTabStyle}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <nav className="main-nav main-nav--secondary">
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={navTabStyle}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
