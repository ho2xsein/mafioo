import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { AppShell } from "./design-system/AppShell";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { CityPage } from "./pages/City";
import { StreetPage, StreetRedirect } from "./pages/Street";
import { BankPage } from "./pages/Bank";
import { InventoryPage } from "./pages/Inventory";
import { MessagesLayout, InboxPage, SentPage, WritePage } from "./pages/Messages";
import { FriendsPage } from "./pages/Friends";
import { Top10Page } from "./pages/Top10";
import { CrimeLogPage } from "./pages/CrimeLog";
import { ProfilePage } from "./pages/Profile";
import { ComingSoonPage } from "./pages/ComingSoon";

const COMING_SOON_ROUTES: { path: string; title: string }[] = [
  { path: "/school", title: "School" },
  { path: "/fitness", title: "Fitness" },
  { path: "/bars", title: "Bars" },
  { path: "/contrabandist", title: "Contrabandist" },
  { path: "/market", title: "Black Market" },
  { path: "/jail", title: "Jail" },
  { path: "/hospital", title: "Hospital" },
  { path: "/skills", title: "Skills" },
  { path: "/rackets", title: "Rackets" },
  { path: "/quests", title: "Quests" },
  { path: "/tasks", title: "Tasks" },
  { path: "/polls", title: "Polls" },
];

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<AppShell />}>
            <Route path="/" element={<CityPage />} />
            <Route path="/city" element={<CityPage />} />
            <Route path="/street" element={<StreetRedirect />} />
            <Route path="/street/:x/:y" element={<StreetPage />} />
            <Route path="/bank" element={<BankPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/msg" element={<MessagesLayout />}>
              <Route path="inbox" element={<InboxPage />} />
              <Route path="sent" element={<SentPage />} />
              <Route path="write" element={<WritePage />} />
            </Route>
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/top10/:metric" element={<Top10Page />} />
            <Route path="/crime_log" element={<CrimeLogPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            {COMING_SOON_ROUTES.map((r) => (
              <Route key={r.path} path={r.path} element={<ComingSoonPage title={r.title} />} />
            ))}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
