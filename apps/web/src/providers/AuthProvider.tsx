"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  apiGetMe,
  apiGetMyOrg,
  apiLogin,
  clearTokens,
  getToken,
  setTokens,
  type ApiAuthUser,
} from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  /** Display role label, e.g. "Super Admin" or "Org Admin". */
  role: string;
  initials: string;
  superAdmin: boolean;
  organizationId: string | null;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  /** Module keys the current org's package grants (e.g. ["CMS","CRM"]). */
  modules: string[];
  organizationName: string | null;
  /** True if the user may access a given module (super admins always can). */
  hasModule: (key: string) => boolean;
  /** Display name for a module key, falling back to the provided label. */
  moduleLabel: (key: string, fallback: string) => string;
  /** Re-fetch the current user (e.g. after a profile update). */
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function initialsOf(name: string | null, email: string): string {
  const source = (name && name.trim()) || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (letters || source.slice(0, 2)).toUpperCase();
}

function roleLabel(u: ApiAuthUser): string {
  if (u.superAdmin) return "Super Admin";
  const first = u.roles[0];
  if (!first) return "Member";
  return first
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toAuthUser(u: ApiAuthUser): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name || u.email,
    role: roleLabel(u),
    initials: initialsOf(u.name, u.email),
    superAdmin: u.superAdmin,
    organizationId: u.organizationId,
    roles: u.roles,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [moduleNames, setModuleNames] = useState<Record<string, string>>({});
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Load the org's entitled modules (skipped for super admins, who see all). */
  const loadOrgContext = useCallback(async (authUser: ApiAuthUser) => {
    if (authUser.superAdmin || !authUser.organizationId) {
      setModules([]);
      setModuleNames({});
      setOrganizationName(null);
      return;
    }
    try {
      const org = await apiGetMyOrg();
      setModules(org.modules ?? []);
      setModuleNames(org.moduleNames ?? {});
      setOrganizationName(org.name);
    } catch {
      setModules([]);
      setModuleNames({});
      setOrganizationName(null);
    }
  }, []);

  // Rehydrate session from a stored token on mount.
  useEffect(() => {
    (async () => {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await apiGetMe();
        setUser(toAuthUser(me));
        await loadOrgContext(me);
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [loadOrgContext]);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const me = await apiGetMe();
      setUser(toAuthUser(me));
      await loadOrgContext(me);
    } catch {
      // Keep the existing session on a transient failure.
    }
  }, [loadOrgContext]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      setTokens(res.accessToken, res.refreshToken);
      setUser(toAuthUser(res.user));
      await loadOrgContext(res.user);
    },
    [loadOrgContext],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setModules([]);
    setModuleNames({});
    setOrganizationName(null);
  }, []);

  const hasModule = useCallback(
    (key: string) => !!user?.superAdmin || modules.includes(key),
    [user, modules],
  );

  const moduleLabel = useCallback(
    (key: string, fallback: string) => moduleNames[key] ?? fallback,
    [moduleNames],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isSuperAdmin: !!user?.superAdmin,
        modules,
        organizationName,
        hasModule,
        moduleLabel,
        refreshUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
