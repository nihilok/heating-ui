import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Settings,
  Thermometer,
} from "lucide-react";
import { useAuthContext } from "./context/useAuthContext.ts";
import { LoginPage } from "./components/LoginPage.tsx";
import { PeriodsContainer } from "./components/PeriodsContainer.tsx";
import { Display } from "./components/Display.tsx";
import { useBrowserStorage } from "./hooks/useBrowserStorage.ts";
import { LoadingSpinner } from "./components/LoadingSpinner.tsx";
import { ActionButtons } from "./components/ActionButtons.tsx";
import { PauseButton } from "./components/PauseButton.tsx";
import { Badge } from "./components/ui/badge.tsx";
import { Button } from "./components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card.tsx";
import flame from "./assets/flame.png";

function flashError(err: unknown, detail?: string) {
  let message = "Something went wrong!";
  if (err && typeof err === "object") {
    const error = err as { detail?: string; error?: string; message?: string };
    message = error.detail ?? error.error ?? error.message ?? message;
  }
  if (detail) {
    message += ` ${detail}`;
  }
  toast(message, {
    type: "error",
    theme:
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
  });
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { token } = useAuthContext();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function LoginRoute() {
  const { token } = useAuthContext();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

function SystemPicker({
  systems,
  currentSystemId,
  onSelect,
}: {
  systems: System[];
  currentSystemId: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = systems.find((s) => s.system_id === currentSystemId);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (systems.length === 0) return null;

  if (systems.length === 1) {
    return (
      <Badge className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide">
        {current?.system_id ?? systems[0].system_id}
      </Badge>
    );
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen((o) => !o)}
      >
        <Thermometer className="h-3.5 w-3.5 shrink-0" />
        <span className="max-w-28 truncate text-xs uppercase tracking-wide">
          {current?.system_id ?? "Select"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-md">
          {systems.map((s) => (
            <button
              key={s.system_id}
              type="button"
              className={`flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-100 ${
                s.system_id === currentSystemId
                  ? "font-semibold text-slate-900"
                  : "text-slate-600"
              }`}
              onClick={() => {
                onSelect(s.system_id);
                setOpen(false);
              }}
            >
              <Thermometer className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-xs uppercase tracking-wide">
                {s.system_id}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AppShell({ page }: { page: "dashboard" | "settings" | "periods" }) {
  const { apiUrl, logout } = useAuthContext();
  const { get: loadSystem, set: saveSystem } = useBrowserStorage("currentSystem");
  const [systems, setSystems] = useState<System[]>([]);
  const [currentSystemId, setCurrentSystemId] = useState<string | null>(
    loadSystem() ?? null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const getSystems = React.useCallback(async (): Promise<System[]> => {
    const r = await fetch(`${apiUrl}/systems/`);
    const contentType = r.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      if (r.status !== 200) {
        const err = await r
          .json()
          .catch(() => ({ detail: `Could not retrieve systems (${r.status})` }));
        throw err;
      } else {
        return r.json();
      }
    }
    throw new Error(
      `Could not retrieve systems. JSON response expected (received ${contentType})`,
    );
  }, [apiUrl]);

  const refreshSystems = React.useCallback(() => {
    return getSystems()
      .then((data) => {
        const sorted = data.sort((a, b) => (a.system_id > b.system_id ? 1 : -1));
        setSystems(sorted);
        if (sorted.length > 0) {
          const selectedExists = sorted.some((s) => s.system_id === currentSystemId);
          const next = selectedExists ? currentSystemId : sorted[0].system_id;
          setCurrentSystemId(next);
          if (next) {
            saveSystem(next);
          }
        }
      })
      .catch((err: unknown) => {
        flashError(err);
      });
  }, [currentSystemId, getSystems, saveSystem]);

  useEffect(() => {
    let isMounted = true;
    getSystems()
      .then((data) => {
        if (!isMounted) return;
        const sorted = data.sort((a, b) => (a.system_id > b.system_id ? 1 : -1));
        setSystems(sorted);
        if (sorted.length > 0) {
          const selectedExists = sorted.some((s) => s.system_id === currentSystemId);
          const next = selectedExists ? currentSystemId : sorted[0].system_id;
          setCurrentSystemId(next);
          if (next) {
            saveSystem(next);
          }
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        flashError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentSystemId, getSystems, saveSystem]);

  const currentSystem = useMemo(
    () => systems.find((s) => s.system_id === currentSystemId),
    [systems, currentSystemId],
  );

  const handleSelectSystem = (id: string) => {
    setCurrentSystemId(id);
    saveSystem(id);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      {/* Top header */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-slate-200 bg-white px-4">
        <h1 className="flex items-center gap-1 text-lg font-bold tracking-tight">
          He
          <img src={flame} alt="flame" className="h-5" />
          t
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {!isLoading && (
            <SystemPicker
              systems={systems}
              currentSystemId={currentSystemId}
              onSelect={handleSelectSystem}
            />
          )}
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Scrollable content — padded clear of fixed header and bottom nav */}
      <main className="flex-1 px-4 pb-24 pt-20">
        {isLoading ? (
          <div className="mt-12 text-center">
            <LoadingSpinner show={true} />
            <p className="mt-4 text-sm text-slate-500">Loading systems...</p>
          </div>
        ) : !currentSystem ? (
          <Card>
            <CardHeader>
              <CardTitle>No system selected</CardTitle>
              <CardDescription>
                Use the system selector in the header to choose a heating system.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            {page === "dashboard" && (
              <>
                <Display currentSystemId={currentSystemId} currentSystem={currentSystem} />
                <Card>
                  <CardHeader>
                    <CardTitle>Quick controls</CardTitle>
                    <CardDescription>
                      Manage overrides and program state for the selected system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-start gap-6">
                      <ActionButtons
                        currentSystem={currentSystem}
                        refreshSystems={refreshSystems}
                      />
                      <PauseButton
                        currentSystem={currentSystem}
                        refreshSystems={refreshSystems}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {page === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Configure schedule and program behavior for{" "}
                    <span className="font-semibold">{currentSystem.system_id}</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                    Program status:{" "}
                    <span className="font-semibold">
                      {currentSystem.program ? "Running" : "Paused"}
                    </span>
                  </div>
                  <PauseButton
                    currentSystem={currentSystem}
                    refreshSystems={refreshSystems}
                  />
                  <Button asChild variant="secondary">
                    <Link to="/settings/periods">
                      <CalendarClock className="h-4 w-4" />
                      Configure periods
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {page === "periods" && (
              <>
                <Button asChild variant="ghost" size="sm" className="-ml-2">
                  <Link to="/settings">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Settings
                  </Link>
                </Button>
                <PeriodsContainer
                  systems={systems}
                  currentSystemId={currentSystemId}
                  refreshSystems={refreshSystems}
                />
              </>
            )}
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
              isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
              isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            }`
          }
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell page="dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppShell page="settings" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/periods"
          element={
            <ProtectedRoute>
              <AppShell page="periods" />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer newestOnTop={false} />
    </>
  );
}

export default App;
