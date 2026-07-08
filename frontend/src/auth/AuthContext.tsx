import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from "react";
import type { AuthResponse, PlayerMe } from "@mafioo/shared";
import { api } from "../api/client";

interface AuthContextValue {
  player: PlayerMe | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [player, setPlayer] = useState<PlayerMe | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<AuthResponse>("/auth/me");
      setPlayer(data.player);
    } catch {
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setPlayer(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <AuthContext.Provider value={{ player, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
